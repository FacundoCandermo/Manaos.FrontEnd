// Espejo de Manaos.Application.Dtos.MovimientoStock.MovimientoStockResponseDto
export interface MovimientoStockResponseDto {
  id: number
  idProducto: number
  idBodega: number
  tipo: string
  cantidad: number
  fecha: string
  observaciones?: string
}
