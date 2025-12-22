import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// 1. 설정값 정의 (환경변수나 기본값 사용)
const serviceName = process.env.OTEL_SERVICE_NAME || 'board-playground-api';
const serviceVersion = '1.0.0';
// 2. Exporter 설정
const traceExporter = new OTLPTraceExporter({
  url: 'http://127.0.0.1:4318/v1/traces',
});

// 3. SDK 인스턴스 생성
const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
  }),
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
    }),
    new PrismaInstrumentation(),
  ],
});

// 4. [핵심] 즉시 실행
sdk.start();

// 5. 종료 처리 등록
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

console.log(
  `🚀 [Backend-Core] OpenTelemetry initialized (${process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT})`,
);
