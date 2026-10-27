// Espejo de Manaos.Application.Dtos.MovimientoStock.MovimientoStockRequestDto
export interface MovimientoStockRequestDto {
  idProducto: number
  idBodega: number
  tipo: number
  cantidad: number
  fecha: string
  observaciones?: string
}
