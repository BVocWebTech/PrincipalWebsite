import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { MapPin, Mail, Phone, Send, Heart } from "lucide-react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institution: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"" | "sending" | "sent" | "error">("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("https://drsrbeenajose.tech/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("sent");
        setFormData({
          name: "",
          email: "",
          institution: "",
          subject: "",
          message: "",
        });
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus(""), 3000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus(""), 3000);
    }
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-2 text-wisdom-blue">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Get in Touch
            </span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-primary">
            Contact
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Reach out for academic collaboration, research discussions, or
            institutional engagement.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>
                Your message will be delivered directly.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="institution"
                  placeholder="Institution"
                  value={formData.institution}
                  onChange={handleChange}
                />
                <Input
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                />
                <Textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                />

                <Button
                  type="submit"
                  className="w-full flex items-center gap-2"
                  disabled={status === "sending"}
                >
                  <Send className="w-4 h-4" />
                  {status === "sending" ? "Sending..." : "Send Message"}
                </Button>

                {status === "sent" && (
                  <p className="text-green-600 text-sm text-center">
                    Message sent successfully!
                  </p>
                )}
                {status === "error" && (
                  <p className="text-red-600 text-sm text-center">
                    Failed to send message. Please try again.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
