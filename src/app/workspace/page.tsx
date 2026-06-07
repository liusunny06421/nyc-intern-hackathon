import { redirect } from "next/navigation";

// The standalone workspace mockup has been retired in favour of the repo's
// live room experience (real World Labs 3D + furniture shopping), which now
// renders in the DormDesign theme. Send anyone landing here to the demo room.
export default function WorkspacePage() {
  redirect("/room/B1207");
}
