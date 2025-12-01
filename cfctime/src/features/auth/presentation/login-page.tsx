import { Timer } from "lucide-react"
import { LoginForm } from "@/features/auth/presentation/components/login-form"
import { FormProvider } from "react-hook-form";
import { useLoginPage } from "./hooks/use-login-page";


export function LoginPage() {
  const { form, onSubmit } = useLoginPage();

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Timer className="size-4" />
          </div>
          CFC Time.
        </a>
        <FormProvider  {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
             <LoginForm />  
          </form>
         
        </FormProvider>
        
      </div>
    </div>
  )
}