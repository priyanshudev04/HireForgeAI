"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronLeft, MessageCircle, ShieldCheck, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Channel = "sms" | "whatsapp"
type Step = "phone" | "code" | "email"

export function PhoneAuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>("phone")
  const [channel, setChannel] = React.useState<Channel>("sms")
  const [phone, setPhone] = React.useState("")
  const [code, setCode] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState("")

  const sendCode = (event: React.FormEvent) => {
    event.preventDefault()
    if (!/^\+?[1-9]\d{7,14}$/.test(phone.replace(/[\s()-]/g, ""))) {
      setError("Enter a valid phone number with country code, for example +91 98765 43210.")
      return
    }
    setError("")
    setStep("code")
  }

  const verifyCode = (event: React.FormEvent) => {
    event.preventDefault()
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the six-digit verification code.")
      return
    }
    setError("")
    if (mode === "sign-up") setStep("email")
    else router.push("/dashboard")
  }

  const finishSignup = (event: React.FormEvent) => {
    event.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address for verification and billing receipts.")
      return
    }
    router.push("/dashboard")
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/90 p-6 shadow-xl backdrop-blur sm:p-8">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 font-heading text-lg font-bold"><span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">H</span>HireForge<span className="text-primary">.ai</span></Link>
      {step === "phone" && <form onSubmit={sendCode} className="space-y-5"><div><h1 className="font-heading text-2xl font-bold">{mode === "sign-in" ? "Welcome back" : "Create your account"}</h1><p className="mt-2 text-sm text-muted-foreground">Use your phone number to receive a secure one-time code.</p></div><Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" autoComplete="tel" inputMode="tel" aria-label="Phone number" error={error} /><div className="grid grid-cols-2 gap-3"><ChannelButton active={channel === "sms"} icon={Smartphone} label="SMS" onClick={() => setChannel("sms")} /><ChannelButton active={channel === "whatsapp"} icon={MessageCircle} label="WhatsApp" onClick={() => setChannel("whatsapp")} /></div>{error && <p className="text-xs text-destructive">{error}</p>}<Button type="submit" className="w-full">Send OTP via {channel === "sms" ? "SMS" : "WhatsApp"}</Button><p className="text-center text-xs text-muted-foreground">{mode === "sign-in" ? "New to HireForge?" : "Already have an account?"} <Link className="font-semibold text-primary" href={mode === "sign-in" ? "/sign-up" : "/sign-in"}>{mode === "sign-in" ? "Sign up" : "Sign in"}</Link></p></form>}
      {step === "code" && <form onSubmit={verifyCode} className="space-y-5"><button type="button" onClick={() => setStep("phone")} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ChevronLeft className="size-3.5" />Change number</button><div><h1 className="font-heading text-2xl font-bold">Enter verification code</h1><p className="mt-2 text-sm text-muted-foreground">We sent a code to {phone} via {channel === "sms" ? "SMS" : "WhatsApp"}.</p></div><Input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" inputMode="numeric" autoComplete="one-time-code" className="h-12 text-center font-mono text-xl tracking-[0.5em]" error={error} />{error && <p className="text-xs text-destructive">{error}</p>}<Button type="submit" className="w-full">Verify and continue</Button><button type="button" className="w-full text-xs font-medium text-primary">Resend code</button></form>}
      {step === "email" && <form onSubmit={finishSignup} className="space-y-5"><div className="grid size-11 place-items-center rounded-xl bg-success/10 text-success"><CheckCircle2 className="size-6" /></div><div><h1 className="font-heading text-2xl font-bold">Phone verified</h1><p className="mt-2 text-sm text-muted-foreground">Add your email for account recovery and payment receipts.</p></div><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" error={error} />{error && <p className="text-xs text-destructive">{error}</p>}<Button type="submit" className="w-full">Continue to dashboard</Button><p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-primary" />You will verify this email during onboarding.</p></form>}
    </div>
  )
}

function ChannelButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof Smartphone; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}><Icon className="size-4" />{label}</button>
}
