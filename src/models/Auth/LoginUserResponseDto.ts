// Espejo de Libros.Application.Dtos.Login.LoginUserResponseDto
export interface LoginUserResponseDto {
  login: boolean
  token: string | null
  userName: string | null
  mail: string | null
  errores: string[] | null
}
