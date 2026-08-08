"use client"

import * as React from "react"
import { Send, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField } from "@/components/shared/form-field"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export function ContactForm() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.name.trim()) errs.name = "Full name is required."
    if (!formData.email.trim()) {
      errs.email = "Email address is required."
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Please enter a valid email address."
    }
    if (!formData.subject.trim()) errs.subject = "Subject is required."
    if (!formData.message.trim()) {
      errs.message = "Message cannot be empty."
    } else if (formData.message.length < 10) {
      errs.message = "Message must be at least 10 characters."
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    // Controlled placeholder submit handler (PRD Part 11: no real backend connection)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      setFormData({ name: "", email: "", subject: "", message: "" })
      setErrors({})
    }, 1200)
  }

  return (
    <Card glass className="max-w-xl mx-auto p-6 md:p-8 shadow-xl border-border/80">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-bold font-heading">Get in Touch</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          Have questions about HireForge AI or need campus onboarding? Send us a message.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {isSuccess ? (
          <div className="rounded-xl border border-success/30 bg-success/10 p-6 text-center text-foreground animate-in fade-in-0 duration-300">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/20 text-success mx-auto mb-3">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="font-heading text-lg font-bold">Message Sent!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Thank you for contacting HireForge AI. Our support team will get back to you within 24 hours.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSuccess(false)}
              className="mt-5"
            >
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Full Name" required error={errors.name} htmlFor="contact-name">
              <Input
                id="contact-name"
                placeholder="Alex Chen"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
              />
            </FormField>

            <FormField label="Email Address" required error={errors.email} htmlFor="contact-email">
              <Input
                id="contact-email"
                type="email"
                placeholder="alex.chen@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!errors.email}
              />
            </FormField>

            <FormField label="Subject" required error={errors.subject} htmlFor="contact-subject">
              <Input
                id="contact-subject"
                placeholder="Campus Partnership / General Inquiry"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                error={!!errors.subject}
              />
            </FormField>

            <FormField label="Message" required error={errors.message} htmlFor="contact-message">
              <Textarea
                id="contact-message"
                placeholder="Tell us how we can help you..."
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                error={!!errors.message}
              />
            </FormField>

            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              className="w-full h-11 text-base font-medium mt-2"
            >
              <Send className="mr-2 size-4" />
              Send Message
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
