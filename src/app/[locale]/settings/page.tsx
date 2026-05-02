"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEmployeeStore } from "@/application/store/useEmployeeStore";
import { Employee } from "@/shared/types";
import { useEffect, useMemo } from "react";
import { useInitializeDatabase } from "@/infrastructure/hooks/useInitializeDatabase";
import { APP_FULL_NAME, APP_VERSION } from "@/config/version";

type SettingsFormValues = {
  fullName: string;
  employeeNumber: string;
  shiftStartTime: string;
  hourlyRateInput: string;
};

function parseHourlyRate(input: string): number {
  return Number(input.replace(",", "."));
}

export default function SettingsPage() {
  const t = useTranslations("Navigation");
  const tSettings = useTranslations("Settings");
  const { currentEmployee, setEmployee } = useEmployeeStore();
  const { ensureInitialized } = useInitializeDatabase();

  const settingsSchema = useMemo(
    () =>
      z.object({
        fullName: z.string().min(2, tSettings("validationNameTooShort")),
        employeeNumber: z.string().min(1, tSettings("validationEmployeeNumberRequired")),
        shiftStartTime: z
          .string()
          .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, tSettings("validationShiftStartTimeInvalid")),
        hourlyRateInput: z
          .string()
          .trim()
          .regex(/^\d+(?:[.,]\d{1,2})?$/, tSettings("validationHourlyRatePositive")),
      }),
    [tSettings]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      fullName: "",
      employeeNumber: "",
      shiftStartTime: "07:30",
      hourlyRateInput: "15,00",
    },
  });

  useEffect(() => {
    if (!currentEmployee) return;
    reset({
      fullName: currentEmployee.fullName,
      employeeNumber: currentEmployee.employeeNumber,
      shiftStartTime: currentEmployee.shiftStartTime,
      hourlyRateInput: currentEmployee.hourlyRate.toFixed(2).replace(".", ","),
    });
  }, [currentEmployee, reset]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      const db = await ensureInitialized();
      const hourlyRate = parseHourlyRate(data.hourlyRateInput);

      const newEmployee: Employee = {
        id: currentEmployee?.id || crypto.randomUUID(),
        fullName: data.fullName,
        employeeNumber: data.employeeNumber,
        shiftStartTime: data.shiftStartTime,
        hourlyRate,
      };

      await db.employees.put(newEmployee);
      setEmployee(newEmployee);
      alert(tSettings("successMessage"));
    } catch (error) {
      console.error('Error saving employee data:', error);
      alert(tSettings("errorMessage") || "Error saving data. Please try again.");
    }
  };

  return (
    <div className="container max-w-3xl mx-auto p-4 md:py-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("settings")}</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{tSettings("profileDetailsTitle")}</CardTitle>
            <CardDescription>{tSettings("profileDetailsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{tSettings("name")}</Label>
              <Input id="fullName" {...register("fullName")} />
              {errors.fullName ? <p className="text-sm text-red-500">{errors.fullName.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeNumber">{tSettings("employeeNumber")}</Label>
              <Input id="employeeNumber" {...register("employeeNumber")} />
              {errors.employeeNumber ? <p className="text-sm text-red-500">{errors.employeeNumber.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shiftStartTime">{tSettings("shiftStartTime")}</Label>
              <Input id="shiftStartTime" type="time" {...register("shiftStartTime")} />
              {errors.shiftStartTime ? <p className="text-sm text-red-500">{errors.shiftStartTime.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRateInput">{tSettings("hourlyRate")}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">€</span>
                <Input id="hourlyRateInput" type="text" inputMode="decimal" className="pl-8" {...register("hourlyRateInput")} />
              </div>
              {errors.hourlyRateInput ? <p className="text-sm text-red-500">{errors.hourlyRateInput.message}</p> : null}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">{tSettings("save")}</Button>
          </CardFooter>
        </Card>
      </form>
      
      {/* App Version Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre o Aplicativo</CardTitle>
          <CardDescription>Informações sobre a versão do My Clock</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Versão:</span>
            <span className="text-sm text-muted-foreground">{APP_VERSION}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Nome:</span>
            <span className="text-sm text-muted-foreground">{APP_FULL_NAME}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
