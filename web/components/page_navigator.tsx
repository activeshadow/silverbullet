import { FilterList } from "./filter.tsx";
import { FilterOption, PageMeta } from "../../common/types.ts";

export function PageNavigator({
  allPages,
  onNavigate,
  currentPage,
}: {
  allPages: Set<PageMeta>;
  onNavigate: (page: string | undefined) => void;
  currentPage?: string;
}) {
  const options: FilterOption[] = [];
  for (const pageMeta of allPages) {
    // Order by last modified date in descending order
    let orderId = -pageMeta.lastModified;
    // Unless it was opened in this session
    if (pageMeta.lastOpened) {
      orderId = -pageMeta.lastOpened;
    }
    // Or it's the currently open page
    if (currentPage && currentPage === pageMeta.name) {
      // ... then we put it all the way to the end
      orderId = Infinity;
    }
    options.push({
      ...pageMeta,
      orderId: orderId,
    });
  }
  let completePrefix: string | undefined = undefined;
  if (currentPage && currentPage.includes("/")) {
    const pieces = currentPage.split("/");
    completePrefix = pieces.slice(0, pieces.length - 1).join("/") + "/";
  } else if (currentPage && currentPage.includes(" ")) {
    completePrefix = currentPage.split(" ")[0] + " ";
  }
  return (
    <FilterList
      placeholder="Page"
      label="Open"
      options={options}
      // icon={faFileLines}
      allowNew={true}
      helpText="Start typing the page name to filter results, press <code>Return</code> to open."
      newHint="Create page"
      completePrefix={completePrefix}
      onSelect={(opt) => {
        onNavigate(opt?.name);
      }}
    />
  );
}
