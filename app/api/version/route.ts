export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ id: process.env.BUILD_ID });
}
