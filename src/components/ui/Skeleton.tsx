export default function Skeleton({
  width = '100%', height = 16, radius = 8, style,
}: { width?: string | number; height?: number; radius?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg, #E8F0EB 25%, #F3F9F5 50%, #E8F0EB 75%)',
      backgroundSize: '200% 100%',
      animation: 'ap-shimmer 1.4s ease-in-out infinite',
      ...style,
    }} />
  );
}
