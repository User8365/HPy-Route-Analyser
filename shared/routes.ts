
import { z } from 'zod';
import { insertAnalysisSchema, analysis } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  analysis: {
    upload: {
      method: 'POST' as const,
      path: '/api/analyze',
      input: z.object({
        fileContent: z.string(),
        fileName: z.string(),
      }),
      responses: {
        200: z.object({
          points: z.array(z.object({
            time: z.string(),
            hdg: z.string(),
            twa: z.string(),
            absTwa: z.number(),
            sail: z.string(),
            sog: z.number(),
            tws: z.number(),
            isFoilsActive: z.boolean(),
            isFoils100: z.boolean(),
            distGain: z.number(),
          })),
          stats: z.object({
            totalDuration: z.string(),
            totalDurationMinutes: z.number(),
            sailChanges: z.number(),
            gybeTackCount: z.number(),
            percentFoils100: z.number(),
            totalFoilTimeSaved: z.string(),
            paidSailStats: z.array(z.object({
              name: z.string(),
              category: z.string(),
              usagePercent: z.number(),
              foilTimePercent: z.number(),
              totalTimeMinutes: z.number(),
            }))
          })
        }),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type AnalyzeInput = z.infer<typeof api.analysis.upload.input>;
export type AnalyzeResponse = z.infer<typeof api.analysis.upload.responses[200]>;
