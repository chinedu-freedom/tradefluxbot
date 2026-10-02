"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/schemas";
import { usePost } from "@/hooks/useApi";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuthToken } from "@/config/axiosInstance";
import { Controller } from "react-hook-form";
import { useFetchData } from "@/hooks/useApi";
import ReactSelect from "react-select";
import { useEffect, useState, Suspense } from "react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");
  const [isMounted, setIsMounted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: "",
      username: "",
      email: "",
      country_id: "",
      referred_by_code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signupMutation = usePost("/auth/register", null);
  const { data: settingsResponse, isLoading: isLoadingSettings } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "TradeFluxBot";
  const siteLogo = settings.platform_logo || "/logo.jpeg";

  const { data: countriesRes, isLoading: isLoadingCountries } = useFetchData("/auth/countries", ["countries"]);
  const countries = Array.isArray(countriesRes) ? countriesRes : countriesRes?.data || [];
  const countryOptions = countries.map(c => ({ value: c.id, label: c.country_name }));

  useEffect(() => {
    setIsMounted(true);
    if (refCode) {
      setValue("referred_by_code", refCode);
    }
  }, [refCode, setValue]);

  if (!isMounted || isLoadingSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#0073b6] rounded-full animate-spin"></div>
      </div>
    );
  }

  const onSubmit = (data) => {
    const payload = {
      full_name: data.full_name,
      username: data.username,
      email: data.email,
      country_id: data.country_id,
      referred_by_code: data.referred_by_code || undefined,
      password: data.password,
    };

    signupMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res?.token) {
          setAuthToken(res.token);
        }
        router.push("/dashboard"); 
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Left section */}
      <div className="w-full max-w-xl flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-10 flex flex-col items-center text-center">
            {siteLogo && !imgError ? (
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-gray-50 border border-gray-100 mb-4">
                <img 
                  src={siteLogo} 
                  alt="Logo" 
                  className="w-full h-full object-contain" 
                  onError={() => setImgError(true)}
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-[#0073b6] to-[#0f172a] rounded-full flex items-center justify-center shadow-sm mb-4">
                <div className="text-white text-xs font-bold tracking-wider">
                  {siteName.substring(0, 4).toUpperCase()}
                </div>
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign up</h1>
            <p className="text-gray-500 text-sm">
              Sign up for free and start growing your wealth today on {siteName}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <Input label="Full Name" {...register("full_name")} />
              {errors.full_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.full_name.message}
                </p>
              )}
            </div>
            {/* Username */}
            <div>
              <Input label="Username" {...register("username")} />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Input label="Email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Country ID */}
            <div>
              <Controller
                control={control}
                name="country_id"
                render={({ field }) => (
                  <ReactSelect
                    {...field}
                    options={countryOptions}
                    placeholder="Select Country"
                    onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                    value={countryOptions.find((c) => c.value === field.value) || null}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: '48px',
                        borderColor: state.isFocused ? '#0073b6' : '#d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 1px #0073b6' : 'none',
                        '&:hover': {
                          borderColor: state.isFocused ? '#0073b6' : '#d1d5db'
                        },
                        borderRadius: '0.375rem',
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999
                      }),
                      option: (base, state) => ({
                        ...base,
                        color: 'black',
                        backgroundColor: state.isFocused ? '#f0f9ff' : 'white',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: 'black'
                      })
                    }}
                  />
                )}
              />
              {errors.country_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.country_id.message}
                </p>
              )}
            </div>



            {/* Password */}
            <div>
              <Input
                label="Password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Input
                label="Confirm Password"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Referral Code */}
            <div>
              <Controller
                control={control}
                name="referred_by_code"
                defaultValue={refCode || ""}
                render={({ field }) => (
                  <Input 
                    label="Invitation Code (Optional)" 
                    {...field} 
                  />
                )}
              />
              {errors.referred_by_code && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.referred_by_code.message}
                </p>
              )}
            </div>
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-amber-600 text-white hover:bg-amber-700 rounded-md py-4 font-medium transition-all"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="10" height="10" x="1" y="1" fill="currentColor" rx="1"><animate id="SVG7WybndBt" fill="freeze" attributeName="x" begin="0;SVGo3aOUHlJ.end" dur="0.2s" values="1;13" /><animate id="SVGVoKldbWM" fill="freeze" attributeName="y" begin="SVGFpk9ncYc.end" dur="0.2s" values="1;13" /><animate id="SVGKsXgPbui" fill="freeze" attributeName="x" begin="SVGaI8owdNK.end" dur="0.2s" values="13;1" /><animate id="SVG7JzAfdGT" fill="freeze" attributeName="y" begin="SVG28A4To9L.end" dur="0.2s" values="13;1" /></rect><rect width="10" height="10" x="1" y="13" fill="currentColor" rx="1"><animate id="SVGUiS2jeZq" fill="freeze" attributeName="y" begin="SVG7WybndBt.end" dur="0.2s" values="13;1" /><animate id="SVGU0vu2GEM" fill="freeze" attributeName="x" begin="SVGVoKldbWM.end" dur="0.2s" values="1;13" /><animate id="SVGOIboFeLf" fill="freeze" attributeName="y" begin="SVGKsXgPbui.end" dur="0.2s" values="1;13" /><animate id="SVG14lAaeuv" fill="freeze" attributeName="x" begin="SVG7JzAfdGT.end" dur="0.2s" values="13;1" /></rect><rect width="10" height="10" x="13" y="13" fill="currentColor" rx="1"><animate id="SVGFpk9ncYc" fill="freeze" attributeName="x" begin="SVGUiS2jeZq.end" dur="0.2s" values="13;1" /><animate id="SVGaI8owdNK" fill="freeze" attributeName="y" begin="SVGU0vu2GEM.end" dur="0.2s" values="13;1" /><animate id="SVG28A4To9L" fill="freeze" attributeName="x" begin="SVGOIboFeLf.end" dur="0.2s" values="1;13" /><animate id="SVGo3aOUHlJ" fill="freeze" attributeName="y" begin="SVG14lAaeuv.end" dur="0.2s" values="1;13" /></rect></svg> : "Sign up"}
            </Button>

          </form>

          {/* Already have an account */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/"
              className="text-amber-600 font-medium hover:underline cursor-pointer"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right section */}

    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
