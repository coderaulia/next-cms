import { serializeJsonForScript } from '@/services/requestSecurity';

type SeoJsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function SeoJsonLd({ data }: SeoJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonForScript(data)
      }}
    />
  );
}
