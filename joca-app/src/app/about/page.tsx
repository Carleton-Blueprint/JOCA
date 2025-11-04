import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="flex justify-center items-center min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12 md:py-20 bg-muted/50">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">{"About JOCA"}</h1>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="prose prose-lg max-w-none pt-6">
                  <p className="text-lg leading-relaxed">
                    {
                      "Welcome to the Jamaican Ottawa Community Association (JOCA) — a vibrant organization dedicated to celebrating Jamaican culture, supporting our community, and strengthening the connection between Jamaica and the Ottawa region."
                    }
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
                  <p className="leading-relaxed">
                    JOCA’s mission is to promote unity, cultural awareness, and
                    empowerment within the Jamaican and wider Caribbean
                    community in Ottawa. We aim to preserve and share Jamaican
                    heritage while fostering collaboration, education, and
                    social engagement across generations.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">What We Do</h2>
                  <ul className="space-y-2 leading-relaxed">
                    <li>
                      Host annual cultural events and community gatherings
                    </li>
                    <li>
                      Celebrate Jamaican holidays and heritage through music,
                      food, and art
                    </li>
                    <li>
                      Support youth through mentorship, scholarships, and
                      leadership programs
                    </li>
                    <li>
                      Partner with local organizations to strengthen cultural
                      exchange and inclusion
                    </li>
                    <li>
                      Provide resources and support for newcomers and families
                      in the Ottawa area
                    </li>
                  </ul>

                  <h2 className="text-2xl font-bold mt-8 mb-4">Join Us</h2>
                  <p className="leading-relaxed">
                    Whether you’re of Jamaican descent, part of the Caribbean
                    diaspora, or simply interested in learning more about
                    Jamaica’s rich culture, JOCA welcomes you. Our community
                    thrives on diversity, shared experiences, and a passion for
                    making a positive impact in Ottawa and beyond.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
