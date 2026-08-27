export default function QuickPage() {
  return (
    <main className="min-h-screen bg-[#0e1f14] p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-[#e8f5e9] mb-4">Quick Add</h1>
        <form action={async (formData: FormData) => {
          "use server";
          const { saveBook } = await import("@/app/study/actions");
          await saveBook(formData);
        }} className="space-y-4 bg-[#1a3320] p-6 rounded-2xl border border-[#2a4d32]">
          <input name="title" placeholder="Title" required className="w-full rounded-xl bg-[#0e1f14] border border-[#2a4d32] p-3 text-white" />
          <input name="trail" defaultValue="forest" required className="w-full rounded-xl bg-[#0e1f14] border border-[#2a4d32] p-3 text-white" />
          <input name="level" defaultValue="sprout" required className="w-full rounded-xl bg-[#0e1f14] border border-[#2a4d32] p-3 text-white" />
          <textarea name="source_text" required placeholder="PASTE STORY HERE" className="w-full min-h- rounded-xl bg-[#0e1f14] border-2 border-[#3f8f4f] p-4 text-white text-" />
          <input name="cover" type="file" accept="image/*" className="w-full text-sm text-white/60" />
          <button type="submit" className="w-full rounded-full bg-[#3f8f4f] py-3 font-bold text-white">Save Book</button>
        </form>
      </div>
    </main>
  )
}