import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function StorefrontShell({
  children,
  mainClassName = "",
}: {
  children: React.ReactNode;
  mainClassName?: string;
}) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main" className={mainClassName}>{children}</main>
      <Footer />
    </>
  );
}
