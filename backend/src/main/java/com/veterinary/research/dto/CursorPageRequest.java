package com.veterinary.research.dto;

import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursorPageRequest {

    private Long cursor; // Last or First ID for O(1) Keyset seek
    @Builder.Default
    private String direction = "next"; // "next" or "prev"
    @Builder.Default
    private int size = 25;
    private String search;
    @Builder.Default
    private Map<String, String> filters = new HashMap<>();

    public boolean isKeyset() {
        return cursor != null && cursor > 0;
    }
}
