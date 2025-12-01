import { cn } from "@/lib/utils";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/common/components/ui/field";
import { Input } from "@/common/components/ui/input";
import { useFormContext } from "react-hook-form";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { setValue } = useFormContext();

  const validateAndUpdate = (field: string, value: string) => {
    setValue(field, value, { shouldValidate: true });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={(e) => validateAndUpdate('email', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" required onChange={(e) => validateAndUpdate('password', e.target.value)} />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
              </Field>
            </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
