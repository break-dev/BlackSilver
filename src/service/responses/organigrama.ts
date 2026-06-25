export interface RES_Area {
  id_area: number;
  nombre: string;
  //
  cargos?: RES_Cargo[];
}

export interface RES_Cargo {
  id_cargo: number;
  nombre: string;
}
