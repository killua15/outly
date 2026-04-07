import { redirect } from 'next/navigation'
export default async function Page({ params }: { params: Promise<{ niche: string }> }) {
  const { niche } = await params
  redirect(`/en/outliers/${niche}`)
}
