import { Description } from "./Description";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function AboutPage() {
  return (
    <div className="flex justify-center items-center h-full flex-col">
      <main className="flex-1 p-4">
        <section className="my-8">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">{"About JOCA"}</h1>
            </div>
          </div>
        </section>
        <Description />
      </main>
    </div>
  );
}
