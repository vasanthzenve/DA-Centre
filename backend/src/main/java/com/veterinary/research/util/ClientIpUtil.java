package com.veterinary.research.util;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Utility to extract and sanitize client IP addresses from incoming HTTP requests,
 * taking into account reverse proxies, load balancers, and Docker/Nginx setups.
 */
public final class ClientIpUtil {

    private static final String[] IP_HEADER_CANDIDATES = {
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "X-Real-IP"
    };

    private ClientIpUtil() {}

    /**
     * Extracts the real client IP address from the given HttpServletRequest.
     */
    public static String getClientIpAddress(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }

        for (String header : IP_HEADER_CANDIDATES) {
            String ipList = request.getHeader(header);
            if (ipList != null && !ipList.isBlank() && !"unknown".equalsIgnoreCase(ipList.trim())) {
                String clientIp = ipList.contains(",") ? ipList.split(",")[0].trim() : ipList.trim();
                if (!clientIp.isBlank() && !"unknown".equalsIgnoreCase(clientIp)) {
                    return sanitizeIp(clientIp);
                }
            }
        }

        return sanitizeIp(request.getRemoteAddr());
    }

    /**
     * Normalizes IPv6 loopback and special values into human-readable IP addresses.
     */
    public static String sanitizeIp(String ip) {
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip.trim())) {
            return "127.0.0.1";
        }
        String clean = ip.trim();
        if ("0:0:0:0:0:0:0:1".equals(clean) || "::1".equals(clean)) {
            return "127.0.0.1";
        }
        if (clean.startsWith("::ffff:")) {
            return clean.substring(7);
        }
        return clean;
    }

    /**
     * Identifies the network type of the given IP address.
     */
    public static String getNetworkType(String ip) {
        if (ip == null || ip.isBlank() || "127.0.0.1".equals(ip) || "localhost".equalsIgnoreCase(ip)) {
            return "Localhost";
        }
        if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.matches("^172\\.(1[6-9]|2[0-9]|3[0-1])\\..*")) {
            return "Private LAN";
        }
        if (ip.contains(":")) {
            return "IPv6";
        }
        return "Public IPv4";
    }
}
