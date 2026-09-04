import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function StorefrontShell({
  children,
  mainClassName = "",
  announcement,
}: {
  children: React.ReactNode;
  mainClassName?: string;
  announcement?: string;
}) {
  return (
    <>
      <AnnouncementBar text={announcement} />
      <Header />
      <main id="main" className={mainClassName}>{children}</main>
      <Footer />
    </>
  );
}
