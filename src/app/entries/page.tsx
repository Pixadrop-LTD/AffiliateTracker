import { Metadata } from "next";
import EntriesPageClient from "./page-client";

/**
 * SEO metadata for Entries page
 */
export const metadata: Metadata = {
    title: "Entries",
    description: "View and manage all your affiliate marketing entries and performance data",
    robots: {
        index: true,
        follow: true,
    },
};

/**
 * @Description Entries page wrapper - renders client component
 * @Return {JSX.Element} The entries page
 */
const EntriesPage = () => {
    return <EntriesPageClient />;
};

export default EntriesPage;