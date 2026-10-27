// Numeros espejo de Manaos.Enums.* (Request recibe el numero; Response devuelve el texto)
export interface EnumOption {
  label: string
  value: number
}

export const TipoMovimientoStockOptions: EnumOption[] = [
  { label: 'Ingreso', value: 0 },
  { label: 'Venta', value: 1 },
  { label: 'Ajuste', value: 2 },
  { label: 'Devolucion', value: 3 },
  { label: 'Transferencia', value: 4 },
];

export const EstadoOrdenCompraOptions: EnumOption[] = [
  { label: 'Pendiente', value: 0 },
  { label: 'Enviada', value: 1 },
  { label: 'Recibida', value: 2 },
  { label: 'Cancelada', value: 3 },
];

export const EstadoPedidoOptions: EnumOption[] = [
  { label: 'Pendiente', value: 0 },
  { label: 'Confirmado', value: 1 },
  { label: 'Entregado', value: 2 },
  { label: 'Cancelado', value: 3 },
];

export const EstadoSolicitudReposicionOptions: EnumOption[] = [
  { label: 'Pendiente', value: 0 },
  { label: 'Aprobada', value: 1 },
  { label: 'Rechazada', value: 2 },
  { label: 'Convertida', value: 3 },
];
