import { initClient, InitClientArgs, InitClientReturn } from '@ts-rest/core';
import * as cookie from 'cookie';

import { contract } from '@workspace/contract';
import { TokenPayload } from '@workspace/domain';

import { TestUser } from '@/mocks/user.mock';

export class TestClient {
  private loggedEmail: string | null = null;
  private _accessToken: string | null = null;
  private _cookies: Record<string, string> = {};

  public readonly api: InitClientReturn<typeof contract, InitClientArgs>;

  constructor(private readonly baseUrl: string = 'http://localhost:4000') {
    this.api = initClient(contract, {
      baseUrl: this.baseUrl,
      api: async (args) => {
        const combinedHeaders = {
          ...this.buildAuthHeaders(),
          ...args.headers,
        };

        const response = await fetch(args.path, {
          method: args.method,
          headers: combinedHeaders,
          body: args.body,
        });

        this.handleResponseCookies(response);

        // 안전한 JSON 파싱
        const body = await response.json().catch(() => ({}));

        return {
          status: response.status,
          body,
          headers: response.headers,
        };
      },
    });
  }

  // --- High Level Actions ---

  /**
   * 유저를 등록하고, 로그인 상태(토큰)를 설정한 뒤, 최신 유저 정보를 TestUser에 바인딩합니다.
   */
  async registerAs(user: TestUser) {
    // 1. 회원가입 요청
    const regRes = await this.api.devtools.forceRegister({
      body: user.toRegisterBody(),
    });

    if (regRes.status !== 200) {
      throw new Error(
        `[TestClient] Register failed: ${regRes.status} ${JSON.stringify(regRes.body)}`,
      );
    }

    // 2. 인증 정보 저장
    this.setAuthFromResponse(regRes.body);

    // 3. 내 정보 조회하여 User 객체 동기화 (ID 등 확보)
    await this.syncUser(user);

    return user;
  }

  /**
   * 로그인하고, 토큰 설정 후, 최신 정보를 TestUser에 바인딩합니다.
   */
  async loginAs(user: TestUser) {
    const loginRes = await this.api.devtools.forceLogin({
      body: { email: user.email },
    });

    if (loginRes.status !== 200) {
      throw new Error(`[TestClient] Login failed: ${loginRes.status}`);
    }

    this.setAuthFromResponse(loginRes.body);
    await this.syncUser(user);

    return user;
  }

  /**
   * 현재 토큰으로 '내 정보'를 조회하여 TestUser 객체를 최신화합니다.
   */
  async syncUser(user: TestUser) {
    if (!this.getAccessToken()) {
      throw new Error('[TestClient] Cannot sync user: no access token set');
    }

    if (user.email !== this.getEmail()) {
      throw new Error(
        `[TestClient] Cannot sync user: logged email (${this.getEmail()}) does not match user email (${user.email})`,
      );
    }

    const res = await this.api.user.me.get();
    if (res.status !== 200) {
      throw new Error(`[TestClient] Sync user failed: ${res.status}`);
    }
    // 서버에서 받은 최신 데이터를 TestUser에 주입
    user.bind(res.body.me);
    return user;
  }

  // --- Auth Helpers ---

  private setAuthFromResponse(body: { accessToken?: string; refreshToken?: string }) {
    if (body.accessToken) {
      this.setAccessToken(body.accessToken);
      const payload = this.parseJwtPayload(body.accessToken);
      if (payload) {
        this.loggedEmail = payload.email;
      }
    }
    if (body.refreshToken) this.setRefreshToken(body.refreshToken);
  }

  private buildAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this._accessToken) {
      headers['Authorization'] = `Bearer ${this._accessToken}`;
    }

    const cookieString = Object.entries(this._cookies)
      .map(([k, v]) => cookie.serialize(k, v))
      .join('; ');

    if (cookieString) {
      headers['Cookie'] = cookieString;
    }

    return headers;
  }

  private handleResponseCookies(response: Response) {
    const getSetCookie = response.headers.getSetCookie
      ? response.headers.getSetCookie.bind(response.headers)
      : () => {
          const val = response.headers.get('set-cookie');
          return val ? [val] : [];
        };

    const cookies = getSetCookie();

    cookies.forEach((c: string) => {
      const parsed = cookie.parse(c);
      for (const key in parsed) {
        if (
          !['Path', 'Expires', 'Secure', 'HttpOnly', 'SameSite', 'Domain', 'Max-Age'].includes(key)
        ) {
          this._cookies[key] = parsed[key] as string;
        }
      }
    });
  }

  private parseJwtPayload(token: string): TokenPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = Buffer.from(payload as string, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  }

  // --- Utils ---

  setEmail(email: string) {
    this.loggedEmail = email;
  }
  getEmail() {
    return this.loggedEmail;
  }

  setAccessToken(token: string) {
    this._accessToken = token;
  }
  getAccessToken() {
    return this._accessToken;
  }

  setRefreshToken(token: string) {
    this.setCookie('refreshToken', token);
  }
  getRefreshToken() {
    return this._cookies['refreshToken'];
  }

  setCookie(name: string, value: string) {
    this._cookies[name] = value;
  }

  clearAuth() {
    this._accessToken = null;
    this._cookies = {};
    this.loggedEmail = null;
  }
}
