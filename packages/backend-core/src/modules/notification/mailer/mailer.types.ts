import z from 'zod';

export const SendMailOptionsSchema = z.object({
  to: z.email(),
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().min(1).optional(),
});

export type SendMailOptions = z.infer<typeof SendMailOptionsSchema>;
