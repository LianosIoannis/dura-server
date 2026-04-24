import { join } from "node:path";

export const receiptLogoPath = join(process.cwd(), "src", "order", "receipt", "dura.png");

export const receiptTitle = "ΔΕΛΤΙΟ ΠΑΡΑΛΑΒΗΣ ΕΠΙΣΚΕΥΗΣ";

export const receiptNotice = "(ΤΟ ΠΑΡΟΝ ΔΕΝ ΑΠΟΤΕΛΕΙ ΦΟΡΟΛΟΓΙΚΗ ΑΠΟΔΕΙΞΗ)";

export const header = `Dura Repairs
ΝΤΟΥΡΑ ΕΡΑΛΝΤ ΤΟΥ ΑΛΙ
ΧΟΝΔΡΙΚΟ ΕΜΠΟΡΙΟ ΗΛΕΚΤΡΟΝΙΚΩΝ ΥΠΟΛΟΓΙΣΤΩΝ
ΛΕΩΦΟΡΟΣ ΠΑΠΑΓΟΥ 113 15773 ΖΩΓΡΑΦΟΥ
ΤΗΛ: 2111195507
ΑΦΜ: 147387939
ΔΟΥ: -
ΓΕΜΗ: 172782103000`;

export const footer = `ΟΡΟΙ ΧΡΗΣΗΣ
Παραλαμβάνοντας το παρόν απόκομμα συμφωνείτε στους παρακάτω όρους χρήσης:

ΜΕ ΤΗΝ ΠΑΡΑΛΑΒΗ ΑΥΤΟΥ ΤΟΥ ΑΠΟΚΟΜΜΑΤΟΣ, ΕΞΟΥΣΙΟΔΟΤΩ ΤΗΝ ΕΤΑΙΡΕΙΑ DURA REPAIRS ΚΑΙ ΤΟΥΣ ΤΕΧΝΙΚΟΥΣ ΤΗΣ ΝΑ ΠΡΟΧΩΡΗΣΟΥΝ ΣΤΗΝ ΕΠΙΣΚΕΥΗ ΤΩΝ ΠΡΟΪΟΝΤΩΝ ΠΟΥ ΑΝΑΓΡΑΦΟΝΤΑΙ ΠΑΡΑΠΑΝΩ. ΔΕΝ ΕΠΙΡΡΙΠΤΩ ΟΥΔΕΜΙΑ ΕΥΘΥΝΗ ΣΤΗΝ ΕΤΑΙΡΕΙΑ DURA REPAIRS ΚΑΙ ΓΙΑ ΟΠΟΙΑΔΗΠΟΤΕ ΑΛΛΗ ΒΛΑΒΗ ΜΠΟΡΕΙ ΝΑ ΔΗΜΙΟΥΡΓΗΘΕΙ ΣΤΟ ΠΡΟΪΟΝ ΜΟΥ ΣΤΟ ΜΕΛΛΟΝ ΕΚΤΟΣ ΕΑΝ ΟΦΕΙΛΕΤΑΙ ΚΑΠΟΙΟ ΑΠΟ ΤΑ ΑΝΤΑΛΛΑΚΤΙΚΑ ΤΑ ΟΠΟΙΑ ΑΝΤΙΚΑΤΑΣΤΑΘΗΚΑΝ ΚΑΤΑ ΤΗ ΔΙΑΡΚΕΙΑ ΤΗΣ ΕΠΙΣΚΕΥΗΣ ΠΟΥ ΕΓΙΝΕ.

Ο ΧΡΟΝΟΣ ΕΠΙΣΚΕΥΗΣ ΕΞΑΡΤΑΤΑΙ ΑΠΟ ΤΗΝ ΔΙΑΘΕΣΙΜΟΤΗΤΑ ΤΟΥ ΑΝΤΑΛΛΑΚΤΙΚΟΥ ΤΟΥ ΕΚΑΣΤΟΤΕ ΚΑΤΑΣΚΕΥΑΣΤΗ, ΑΛΛΑ ΚΑΙ ΑΠΡΟΟΠΤΩΝ ΕΠΙΠΛΟΚΩΝ ΚΑΤΑ ΤΗ ΔΙΑΔΙΚΑΣΙΑ ΑΠΟΚΑΤΑΣΤΑΣΗΣ. Η ΕΤΑΙΡΕΙΑ DURA REPAIRS ΔΕΝ ΦΕΡΕΙ ΚΑΜΙΑ ΕΥΘΥΝΗ ΓΙΑ ΟΠΟΙΑΔΗΠΟΤΕ ΚΑΘΥΣΤΕΡΗΣΗ ΚΑΘΩΣ ΚΑΙ ΓΙΑ ΤΙΣ ΣΥΝΕΠΕΙΕΣ ΠΟΥ ΑΥΤΗ ΜΠΟΡΕΙ ΝΑ ΕΧΕΙ ΓΙΑ ΤΟΝ ΠΕΛΑΤΗ.

ΟΙ ΣΥΣΚΕΥΕΣ ΜΕΤΑ ΤΗΝ ΟΛΟΚΛΗΡΩΣΗ ΤΗΣ ΕΠΙΣΚΕΥΗΣ ΘΑ ΚΡΑΤΙΟΥΝΤΑΙ ΣΤΟ ΚΑΤΑΣΤΗΜΑ ΓΙΑ 30 ΗΜΕΡΕΣ ΜΕΤΑ ΤΗΝ ΕΙΔΟΠΟΙΗΣΗ ΣΤΟΝ ΠΕΛΑΤΗ ΓΙΑ ΠΑΡΑΛΑΒΗ. ΜΕΤΑ ΤΟ ΠΕΡΑΣ ΤΩΝ ΗΜΕΡΩΝ ΤΟ ΚΑΤΑΣΤΗΜΑ ΕΧΕΙ ΚΑΘΕ ΝΟΜΙΜΟ ΔΙΚΑΙΩΜΑ ΝΑ ΚΑΤΑΣΤΡΕΨΕΙ ΚΑΙ ΝΑ ΣΤΕΙΛΕΙ ΚΑΙ ΣΥΣΚΕΥΕΣ ΓΙΑ ΑΝΑΚΥΚΛΩΣΗ.`;

export function formatReceiptDate(date: Date) {
	return new Intl.DateTimeFormat("sv-SE", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

export function formatReceiptAmount(amount: number) {
	return new Intl.NumberFormat("el-GR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

export function normalizeReceiptText(text?: string | null) {
	return text?.replace(/\r\n/g, "\n").trim() ?? "";
}

export function buildDeviceSummary(order: {
	deviceType?: string | null;
	deviceBrand?: string | null;
	deviceModel?: string | null;
}) {
	return [order.deviceType, order.deviceBrand, order.deviceModel].filter(Boolean).join(" ");
}
