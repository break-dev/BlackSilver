export interface RES_Area {
  id_area: number;
  nombre: string;
  estado: string;
}

export interface RES_Cargo {
  id_cargo: number;
  nombre: string;
  estado: string;
  id_area: number;
  area_nombre: string;
}
