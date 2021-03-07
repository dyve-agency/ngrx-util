import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoadDataComponent } from "./components/load-data/load-data.component";

const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "load-data",
  },
  {
    path: "load-data",
    component: LoadDataComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
