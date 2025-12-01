import { z } from "zod";
import { useForm } from "react-hook-form";
import { useDependenciesInjection } from "@/common/providers/dependency-injection-provider";

const formSchema = z.object({
  email: z.email({ message: "Invalid email address." }),
  password: z.string().min(2, {
    message: "Password must be at least 2 characters.",
  }),
});

export function useLoginPage() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { loginUserUseCase } = useDependenciesInjection();
  

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const { email, password } = data;
    loginUserUseCase.execute(email, password)
      .then((result) => {
        if(result.ok) {
          console.log("Login successful", result.value);
        }else {
          console.error("Login failed:", result.error?.message);
        }
      });
  };

  return {
    form,
    onSubmit,
  };
}
