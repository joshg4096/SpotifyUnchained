export class ErrorHandler {
  /**
   * Get the error message from error object
   * @param err The error
   * @return The error message
   */
  public static getErrorMessage(err: any): string {
    let message = '';

    if (err.code) {
      switch (err.code) {
        case 11000:
        case 11001:
          message = ErrorHandler.getUniqueErrorMessage(err);
          break;
        default:
          message = 'Something went wrong';
      }
    } else {
      for (const errName in err.errors) {
        if (err.errors[errName].message) {
          message = err.errors[errName].message;
        }
      }
    }

    return message;
  }

  private static getUniqueErrorMessage(err): string {
    let output: string;

    try {
      const fieldName = err.err.substring(err.err.lastIndexOf('.$') + 2,
          err.err.lastIndexOf('_1'));
      output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) +
       ' already exists';
    } catch (ex) {
      output = 'Unique field already exists';
    }

    return output;
  }
}
