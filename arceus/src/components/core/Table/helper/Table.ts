import { createComponent } from "@/components/core/Table/helper/reactHelper";
import styles from "@/components/core/Table/Table.module.sass";

const Table = createComponent("Table", "table", styles.table);
const TableHeader = createComponent("TableHeader", "thead", styles["table-header-row"]);
const TableBody = createComponent("TableBody", "tbody", styles["table-body"]);
const TableFooter = createComponent("TableFooter", "tfoot");
const TableRow = createComponent("TableRow", "tr", styles["table-row"]);
const TableHead = createComponent("TableHead", "th");
const TableCell = createComponent("TableCell", "td", styles["table-cell"]);
const TableCaption = createComponent("TableCaption", "caption");

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
