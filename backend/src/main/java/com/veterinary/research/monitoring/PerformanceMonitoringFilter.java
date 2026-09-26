package com.veterinary.research.monitoring;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
@Slf4j
public class PerformanceMonitoringFilter implements Filter {

    @Value("${server.instance.id:backend-1}")
    private String instanceId;

    private static final long SLOW_REQUEST_THRESHOLD_MS = 500;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (!(request instanceof HttpServletRequest httpRequest) || !(response instanceof HttpServletResponse httpResponse)) {
            chain.doFilter(request, response);
            return;
        }

        long startTime = System.currentTimeMillis();

        try {
            chain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;

            // Attach response time and backend node headers
            httpResponse.setHeader("X-Response-Time-Ms", String.valueOf(duration));
            httpResponse.setHeader("X-Backend-Node", instanceId);

            String uri = httpRequest.getRequestURI();
            String method = httpRequest.getMethod();
            String query = httpRequest.getQueryString();

            // Log warning if API request exceeded 500ms threshold
            if (duration > SLOW_REQUEST_THRESHOLD_MS && !uri.contains("/import-excel") && !uri.contains("/export-excel")) {
                log.warn("[SLOW QUERY ALERT] Node: [{}] {} {}{} took {}ms (threshold: {}ms)",
                        instanceId, method, uri, query != null ? "?" + query : "", duration, SLOW_REQUEST_THRESHOLD_MS);
            }
        }
    }
}
