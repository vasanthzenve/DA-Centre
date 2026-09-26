package com.veterinary.research.dto;

import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
    private boolean hasNext;
    private boolean hasPrevious;

    // Keyset / Cursor Pagination Support for 15M+ records
    private Long nextCursor;
    private Long prevCursor;
    private Boolean hasMore;

    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .hasMore(page.hasNext())
                .build();
    }

    public static <T> PageResponse<T> from(Page<T> page, Function<T, Long> idExtractor) {
        List<T> content = page.getContent();
        Long nextCursor = null;
        Long prevCursor = null;

        if (content != null && !content.isEmpty()) {
            prevCursor = idExtractor.apply(content.get(0));
            nextCursor = idExtractor.apply(content.get(content.size() - 1));
        }

        return PageResponse.<T>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .hasMore(page.hasNext())
                .prevCursor(prevCursor)
                .nextCursor(nextCursor)
                .build();
    }

    public static <T> PageResponse<T> fromCursor(List<T> content, int pageSize, long totalCount, Function<T, Long> idExtractor, boolean hasNext, boolean hasPrevious) {
        Long nextCursor = null;
        Long prevCursor = null;

        if (content != null && !content.isEmpty()) {
            prevCursor = idExtractor.apply(content.get(0));
            nextCursor = idExtractor.apply(content.get(content.size() - 1));
        }

        int totalPages = pageSize > 0 ? (int) Math.ceil((double) totalCount / pageSize) : 1;

        return PageResponse.<T>builder()
                .content(content)
                .pageNumber(0)
                .pageSize(pageSize)
                .totalElements(totalCount)
                .totalPages(totalPages)
                .first(!hasPrevious)
                .last(!hasNext)
                .hasNext(hasNext)
                .hasPrevious(hasPrevious)
                .hasMore(hasNext)
                .prevCursor(prevCursor)
                .nextCursor(nextCursor)
                .build();
    }
}
