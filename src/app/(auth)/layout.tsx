import { SplashSessao } from "@/components/auth/splash-sessao";
import { SCRIPT_SPLASH } from "@/components/auth/splash-sessao-script";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-background">
      {children}
      {/* O script precisa vir logo depois do splash: ele lê o irmão anterior. */}
      <SplashSessao />
      <script dangerouslySetInnerHTML={{ __html: SCRIPT_SPLASH }} />
    </div>
  );
}
