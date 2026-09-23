namespace Dormi.Application.Common;

public class ServiceResult<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? ErrorMessage { get; set; }
    public int StatusCode { get; set; } = 200;

    public static ServiceResult<T> Ok(T data, int statusCode = 200) => new() 
    { 
        Success = true, 
        Data = data, 
        StatusCode = statusCode 
    };

    public static ServiceResult<T> Fail(string error, int statusCode = 400) => new() 
    { 
        Success = false, 
        ErrorMessage = error, 
        StatusCode = statusCode 
    };

    public static ServiceResult<T> NotFound(string error = "Không tìm thấy dữ liệu.") => Fail(error, 404);
    public static ServiceResult<T> Unauthorized(string error = "Không có quyền truy cập.") => Fail(error, 401);
    public static ServiceResult<T> Forbidden(string error = "Bạn không có quyền thực hiện hành động này.") => Fail(error, 403);
}

public class ServiceResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public int StatusCode { get; set; } = 200;

    public static ServiceResult Ok(int statusCode = 200) => new() 
    { 
        Success = true, 
        StatusCode = statusCode 
    };

    public static ServiceResult Fail(string error, int statusCode = 400) => new() 
    { 
        Success = false, 
        ErrorMessage = error, 
        StatusCode = statusCode 
    };

    public static ServiceResult NotFound(string error = "Không tìm thấy dữ liệu.") => Fail(error, 404);
    public static ServiceResult Unauthorized(string error = "Không có quyền truy cập.") => Fail(error, 401);
    public static ServiceResult Forbidden(string error = "Bạn không có quyền thực hiện hành động này.") => Fail(error, 403);
}
