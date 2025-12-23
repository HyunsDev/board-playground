import { registerAs } from '@nestjs/config';
import z from 'zod';

const otelConfigSchema = {
  //   OTEL_EXPORTER_OTLP_ENDPOINT: z.url(),
};

export const otelConfig = registerAs('otel', () => {
  const parsed = z.object(otelConfigSchema).parse(process.env);
  return {
    otelExporterOtlpTracesEndpoint: parsed.OTEL_EXPORTER_OTLP_ENDPOINT,
  };
});

export type OtelConfig = ReturnType<typeof otelConfig>;
