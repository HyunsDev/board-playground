import { initClient, InitClientArgs, InitClientReturn } from '@ts-rest/core';
import * as cookie from 'cookie';

import { contract } from '@workspace/contract';

import { MockUser } from '@/mocks/user.mock';

export class TestClient {
  private _accessToken: string | null = null;
  private _cookies: Record<string, string> = {};

  public readonly api: InitClientReturn<typeof contract, InitClientArgs>;

  constructor(private readonly baseUrl: string = 'http://localhost:4000') {
    this.api = initClient(contract, {
      baseUrl: this.baseUrl,
      api: async (args) => {
        // 1. 현재 상태의 인증 헤더 생성
        const dynamicHeaders = this.buildHeaders();

        // 2. ts-rest가 생성한 헤더(Content-Type 등)와 병합
        // args.headers가 뒤에 오도록 하여, 특정 요청에서 직접 헤더를 덮어쓸 수 있게 함
        const combinedHeaders = {
          ...dynamicHeaders,
          ...args.headers,
        };

        // 3. 요청 전송
        const response = await fetch(args.path, {
          method: args.method,
          headers: combinedHeaders,
          body: args.body,
        });

        // 4. 응답 쿠키 처리
        this.handleResponseCookies(response);

        return {
          status: response.status,
          body: await response.json().catch(() => ({})),
          headers: response.headers,
        };
      },
    });
  }

  async registerAndLogin(user: MockUser) {
    // 1. 회원가입
    const result = await this.api.devtools.forceRegister({
      body: { ...user },
    });
    if (result.status !== 200) {
      throw new Error(`User registration failed with status ${result.status}`);
    }
    this.setAccessToken(result.body.accessToken);
    this.setRefreshToken(result.body.refreshToken);
  }

  async loginAs(email: string) {
    const res = await this.api.devtools.forceLogin({ body: { email } });
    if (res.status !== 200) {
      throw new Error(`Force login failed with status ${res.status}`);
    }
    this.setAccessToken(res.body.accessToken);
    this.setRefreshToken(res.body.refreshToken);
  }

  /**
   * AccessToken과 Cookie를 조합하여 헤더 객체 생성
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this._accessToken) {
      headers['Authorization'] = `Bearer ${this._accessToken}`;
    }

    const cookieString = Object.entries(this._cookies)
      .map(([key, value]) => cookie.serialize(key, value))
      .join('; ');

    if (cookieString) {
      headers['Cookie'] = cookieString;
    }

    return headers;
  }

  /**
   * 응답에서 Set-Cookie 헤더를 파싱하여 상태 저장
   */
  private handleResponseCookies(response: Response) {
    const setCookieHeader =
      typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : response.headers.get('set-cookie');

    if (!setCookieHeader) return;

    const cookiesToSet = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];

    cookiesToSet.forEach((c) => {
      if (!c) return;
      const parsed = cookie.parse(c);
      for (const key in parsed) {
        // 메타 데이터 제외하고 값만 저장
        if (
          ['Path', 'Expires', 'Secure', 'HttpOnly', 'SameSite', 'Domain', 'Max-Age'].includes(key)
        )
          continue;
        this._cookies[key] = parsed[key];
      }
    });
  }

  // --- 유틸리티 ---

  setAccessToken(token: string) {
    this._accessToken = token;
  }

  getAccessToken() {
    return this._accessToken;
  }

  getAccessTokenPayload() {
    if (!this._accessToken) return null;
    const payloadBase64 = this._accessToken.split('.')[1];
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    return JSON.parse(payloadJson);
  }

  getCookie(name: string) {
    return this._cookies[name];
  }

  setCookie(name: string, value: string) {
    this._cookies[name] = value;
  }

  getRefreshToken() {
    return this.getCookie('refreshToken');
  }

  setRefreshToken(token: string) {
    this.setCookie('refreshToken', token);
  }

  clearAuth() {
    this._accessToken = null;
    this._cookies = {};
  }

  clearAccessToken() {
    this._accessToken = null;
  }
}
