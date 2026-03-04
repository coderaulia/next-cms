type SeoJsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function SeoJsonLd({ data }: SeoJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}
