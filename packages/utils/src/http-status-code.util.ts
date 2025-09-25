export enum HTTP_STATUS_CODE {
  // 1xx Informational
  CONTINUE = 100, // The server has received the request headers and the client should proceed to send the request body
  SWITCHING_PROTOCOLS = 101, // The requester has asked the server to switch protocols and the server has agreed to do so
  PROCESSING = 102, // The server has received and is processing the request, but no response is available yet
  EARLY_HINTS = 103, // The server is sending some headers before the final response

  // 2xx Success
  OK = 200, // The request has succeeded
  CREATED = 201, // The request has been fulfilled and resulted in a new resource being created
  ACCEPTED = 202, // The request has been accepted for processing, but the processing has not been completed
  NON_AUTHORITATIVE_INFORMATION = 203, // The server successfully processed the request, but is returning information from another source
  NO_CONTENT = 204, // The server successfully processed the request, but is not returning any content
  RESET_CONTENT = 205, // The server successfully processed the request, but is not returning any content and requires the requester to reset the document view
  PARTIAL_CONTENT = 206, // The server is delivering only part of the resource due to a range header sent by the client
  MULTI_STATUS = 207, // The message body that follows is an XML message and can contain a number of separate response codes
  ALREADY_REPORTED = 208, // The members of a DAV binding have already been enumerated in a previous reply to this request, and are not being included again
  IM_USED = 226, // The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance

  // 3xx Redirection
  MULTIPLE_CHOICES = 300, // Indicates multiple options for the resource from which the client may choose
  MOVED_PERMANENTLY = 301, // This and all future requests should be directed to the given URI
  FOUND = 302, // The resource was found but at a different URI
  SEE_OTHER = 303, // The response to the request can be found under another URI using a GET method
  NOT_MODIFIED = 304, // Indicates that the resource has not been modified since the version specified by the request headers
  USE_PROXY = 305, // The requested resource is available only through a proxy, the address for which is provided in the response
  TEMPORARY_REDIRECT = 307, // The request should be repeated with another URI, but future requests should still use the original URI
  PERMANENT_REDIRECT = 308, // The request and all future requests should be repeated using another URI

  // 4xx Client Error
  BAD_REQUEST = 400, // The server could not understand the request due to invalid syntax
  UNAUTHORIZED = 401, // The client must authenticate itself to get the requested response
  PAYMENT_REQUIRED = 402, // Reserved for future use
  FORBIDDEN = 403, // The client does not have access rights to the content
  NOT_FOUND = 404, // The server can not find the requested resource
  METHOD_NOT_ALLOWED = 405, // The request method is known by the server but is not supported by the target resource
  NOT_ACCEPTABLE = 406, // The server cannot produce a response matching the list of acceptable values defined in the request's proactive content negotiation headers
  PROXY_AUTHENTICATION_REQUIRED = 407, // The client must first authenticate itself with the proxy
  REQUEST_TIMEOUT = 408, // The server timed out waiting for the request
  CONFLICT = 409, // The request could not be completed due to a conflict with the current state of the resource
  GONE = 410, // The resource requested is no longer available and will not be available again
  LENGTH_REQUIRED = 411, // The request did not specify the length of its content, which is required by the requested resource
  PRECONDITION_FAILED = 412, // The server does not meet one of the preconditions that the requester put on the request
  PAYLOAD_TOO_LARGE = 413, // The request is larger than the server is willing or able to process
  URI_TOO_LONG = 414, // The URI provided was too long for the server to process
  UNSUPPORTED_MEDIA_TYPE = 415, // The request entity has a media type which the server or resource does not support
  RANGE_NOT_SATISFIABLE = 416, // The client has asked for a portion of the file, but the server cannot supply that portion
  EXPECTATION_FAILED = 417, // The server cannot meet the requirements of the Expect request-header field
  IM_A_TEAPOT = 418, // The server refuses the attempt to brew coffee with a teapot
  MISDIRECTED_REQUEST = 421, // The request was directed at a server that is not able to produce a response
  UNPROCESSABLE_ENTITY = 422, // The request was well-formed but was unable to be followed due to semantic errors
  LOCKED = 423, // The resource that is being accessed is locked
  FAILED_DEPENDENCY = 424, // The request failed due to failure of a previous request
  TOO_EARLY = 425, // Indicates that the server is unwilling to risk processing a request that might be replayed
  UPGRADE_REQUIRED = 426, // The client should switch to a different protocol
  PRECONDITION_REQUIRED = 428, // The origin server requires the request to be conditional
  TOO_MANY_REQUESTS = 429, // The user has sent too many requests in a given amount of time ("rate limiting")
  REQUEST_HEADER_FIELDS_TOO_LARGE = 431, // The server is unwilling to process the request because its header fields are too large
  UNAVAILABLE_FOR_LEGAL_REASONS = 451, // The user-agent requested a resource that cannot legally be provided, such as a web page censored by a government

  // 5xx Server Error
  INTERNAL_SERVER_ERROR = 500, // The server has encountered a situation it doesn't know how to handle
  NOT_IMPLEMENTED = 501, // The request method is not supported by the server and cannot be handled
  BAD_GATEWAY = 502, // The server, while acting as a gateway or proxy, received an invalid response from the upstream server
  SERVICE_UNAVAILABLE = 503, // The server is not ready to handle the request
  GATEWAY_TIMEOUT = 504, // The server is acting as a gateway and cannot get a response in time
  HTTP_VERSION_NOT_SUPPORTED = 505, // The HTTP version used in the request is not supported by the server
  VARIANT_ALSO_NEGOTIATES = 506, // Transparent content negotiation for the request results in a circular reference
  INSUFFICIENT_STORAGE = 507, // The server is unable to store the representation needed to complete the request
  LOOP_DETECTED = 508, // The server detected an infinite loop while processing the request
  NOT_EXTENDED = 510, // Further extensions to the request are required for the server to fulfill it
  NETWORK_AUTHENTICATION_REQUIRED = 511 // The client needs to authenticate to gain network access
}
