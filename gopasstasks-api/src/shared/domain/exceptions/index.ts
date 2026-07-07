export class DomainException extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = this.constructor.name;
  }
}

export class RecursoNoEncontradoException extends DomainException {
  constructor(recurso: string, id: string) {
    super(`El ${recurso} con ID '${id}' no fue encontrado.`);
  }
}

export class ReglaNegocioException extends DomainException {
  constructor(mensaje: string) {
    super(mensaje);
  }
}

export class RecursoDuplicadoException extends DomainException {
  constructor(recurso: string, campo: string) {
    super(`Ya existe un ${recurso} con ese ${campo}.`);
  }
}
