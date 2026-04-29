import { serializeJsonForScript } from '@/services/requestSecurity';

type SeoJsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
  nonce?: string;
};

export function SeoJsonLd({ data, nonce }: SeoJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: serializeJsonForScript(data)
      }}
    />
  );
}
