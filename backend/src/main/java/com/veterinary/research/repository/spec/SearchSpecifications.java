package com.veterinary.research.repository.spec;

import com.veterinary.research.entity.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SearchSpecifications {

    public static Specification<MarketResearch> marketResearchSpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search query across relevant text fields
            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("states")), pattern),
                        cb.like(cb.lower(root.get("company")), pattern),
                        cb.like(cb.lower(root.get("founded")), pattern),
                        cb.like(cb.lower(root.get("cities")), pattern),
                        cb.like(cb.lower(root.get("model")), pattern),
                        cb.like(cb.lower(root.get("scale")), pattern),
                        cb.like(cb.lower(root.get("service")), pattern),
                        cb.like(cb.lower(root.get("targetSegment")), pattern),
                        cb.like(cb.lower(root.get("product")), pattern),
                        cb.like(cb.lower(root.get("technology")), pattern),
                        cb.like(cb.lower(root.get("price")), pattern)
                );
                predicates.add(searchPredicate);
            }

            // Filters
            if (filters != null) {
                applyFilter(filters, "state", "states", root, cb, predicates);
                applyFilter(filters, "states", "states", root, cb, predicates);
                applyFilter(filters, "company", "company", root, cb, predicates);
                applyFilter(filters, "city", "cities", root, cb, predicates);
                applyFilter(filters, "cities", "cities", root, cb, predicates);
                applyFilter(filters, "model", "model", root, cb, predicates);
                applyFilter(filters, "scale", "scale", root, cb, predicates);
                applyFilter(filters, "targetSegment", "targetSegment", root, cb, predicates);
                applyFilter(filters, "target_segment", "targetSegment", root, cb, predicates);
                applyFilter(filters, "technology", "technology", root, cb, predicates);
                applyFilter(filters, "price", "price", root, cb, predicates);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<VeterinaryEcosystem> veterinaryEcosystemSpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("hospitalName")), pattern),
                        cb.like(cb.lower(root.get("state")), pattern),
                        cb.like(cb.lower(root.get("city")), pattern),
                        cb.like(cb.lower(root.get("area")), pattern),
                        cb.like(cb.lower(root.get("address")), pattern),
                        cb.like(cb.lower(root.get("service")), pattern),
                        cb.like(cb.lower(root.get("analyst")), pattern),
                        cb.like(cb.lower(root.get("phoneNumber")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "state", "state", root, cb, predicates);
                applyFilter(filters, "city", "city", root, cb, predicates);
                applyFilter(filters, "area", "area", root, cb, predicates);
                applyFilter(filters, "businessStatus", "businessStatus", root, cb, predicates);
                applyFilter(filters, "business_status", "businessStatus", root, cb, predicates);
                applyFilter(filters, "service", "service", root, cb, predicates);
                applyFilter(filters, "onlineVerification", "onlineVerification", root, cb, predicates);
                applyFilter(filters, "online_verification", "onlineVerification", root, cb, predicates);
                applyFilter(filters, "analyst", "analyst", root, cb, predicates);

                if (filters.containsKey("rating") && !filters.get("rating").isBlank()) {
                    try {
                        BigDecimal minRating = new BigDecimal(filters.get("rating"));
                        predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), minRating));
                    } catch (Exception ignored) {}
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<HygieneProduct> hygieneProductSpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("productName")), pattern),
                        cb.like(cb.lower(root.get("brandName")), pattern),
                        cb.like(cb.lower(root.get("productCategory")), pattern),
                        cb.like(cb.lower(root.get("subCategory")), pattern),
                        cb.like(cb.lower(root.get("petType")), pattern),
                        cb.like(cb.lower(root.get("manufacturer")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "brandName", "brandName", root, cb, predicates);
                applyFilter(filters, "productCategory", "productCategory", root, cb, predicates);
                applyFilter(filters, "subCategory", "subCategory", root, cb, predicates);
                applyFilter(filters, "petType", "petType", root, cb, predicates);
                applyFilter(filters, "formulation", "formulation", root, cb, predicates);
                applyFilter(filters, "manufacturer", "manufacturer", root, cb, predicates);
                applyFilter(filters, "availability", "availability", root, cb, predicates);
                applyFilter(filters, "status", "status", root, cb, predicates);

                if (filters.containsKey("rating") && !filters.get("rating").isBlank()) {
                    try {
                        predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), new BigDecimal(filters.get("rating"))));
                    } catch (Exception ignored) {}
                }
                if (filters.containsKey("maxPrice") && !filters.get("maxPrice").isBlank()) {
                    try {
                        predicates.add(cb.lessThanOrEqualTo(root.get("price"), new BigDecimal(filters.get("maxPrice"))));
                    } catch (Exception ignored) {}
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<FoodProduct> foodProductSpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("productName")), pattern),
                        cb.like(cb.lower(root.get("brandName")), pattern),
                        cb.like(cb.lower(root.get("productCategory")), pattern),
                        cb.like(cb.lower(root.get("subCategory")), pattern),
                        cb.like(cb.lower(root.get("petType")), pattern),
                        cb.like(cb.lower(root.get("manufacturer")), pattern),
                        cb.like(cb.lower(root.get("address")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "brandName", "brandName", root, cb, predicates);
                applyFilter(filters, "productCategory", "productCategory", root, cb, predicates);
                applyFilter(filters, "subCategory", "subCategory", root, cb, predicates);
                applyFilter(filters, "petType", "petType", root, cb, predicates);
                applyFilter(filters, "lifeStage", "lifeStage", root, cb, predicates);
                applyFilter(filters, "breedSize", "breedSize", root, cb, predicates);
                applyFilter(filters, "dietaryType", "dietaryType", root, cb, predicates);
                applyFilter(filters, "formulation", "formulation", root, cb, predicates);
                applyFilter(filters, "manufacturer", "manufacturer", root, cb, predicates);
                applyFilter(filters, "availability", "availability", root, cb, predicates);

                if (filters.containsKey("rating") && !filters.get("rating").isBlank()) {
                    try {
                        predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), new BigDecimal(filters.get("rating"))));
                    } catch (Exception ignored) {}
                }
                if (filters.containsKey("maxPrice") && !filters.get("maxPrice").isBlank()) {
                    try {
                        predicates.add(cb.lessThanOrEqualTo(root.get("price"), new BigDecimal(filters.get("maxPrice"))));
                    } catch (Exception ignored) {}
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Accessory> accessorySpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("businessName")), pattern),
                        cb.like(cb.lower(root.get("category")), pattern),
                        cb.like(cb.lower(root.get("subCategory")), pattern),
                        cb.like(cb.lower(root.get("petType")), pattern),
                        cb.like(cb.lower(root.get("productDescription")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "businessName", "businessName", root, cb, predicates);
                applyFilter(filters, "category", "category", root, cb, predicates);
                applyFilter(filters, "subCategory", "subCategory", root, cb, predicates);
                applyFilter(filters, "petType", "petType", root, cb, predicates);
                applyFilter(filters, "availability", "availability", root, cb, predicates);

                if (filters.containsKey("maxPrice") && !filters.get("maxPrice").isBlank()) {
                    try {
                        predicates.add(cb.lessThanOrEqualTo(root.get("price"), new BigDecimal(filters.get("maxPrice"))));
                    } catch (Exception ignored) {}
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<ServiceNetwork> serviceNetworkSpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("businessName")), pattern),
                        cb.like(cb.lower(root.get("serviceType")), pattern),
                        cb.like(cb.lower(root.get("state")), pattern),
                        cb.like(cb.lower(root.get("districtRegion")), pattern),
                        cb.like(cb.lower(root.get("area")), pattern),
                        cb.like(cb.lower(root.get("address")), pattern),
                        cb.like(cb.lower(root.get("cityRegion")), pattern),
                        cb.like(cb.lower(root.get("contactNumber")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "businessName", "businessName", root, cb, predicates);
                applyFilter(filters, "serviceType", "serviceType", root, cb, predicates);
                applyFilter(filters, "state", "state", root, cb, predicates);
                applyFilter(filters, "districtRegion", "districtRegion", root, cb, predicates);
                applyFilter(filters, "area", "area", root, cb, predicates);
                applyFilter(filters, "cityRegion", "cityRegion", root, cb, predicates);

                if (filters.containsKey("rating") && !filters.get("rating").isBlank()) {
                    try {
                        predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), new BigDecimal(filters.get("rating"))));
                    } catch (Exception ignored) {}
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Doctor> doctorSpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("doctorName")), pattern),
                        cb.like(cb.lower(root.get("qualification")), pattern),
                        cb.like(cb.lower(root.get("specialist")), pattern),
                        cb.like(cb.lower(root.get("location")), pattern),
                        cb.like(cb.lower(root.get("hospital")), pattern),
                        cb.like(cb.lower(root.get("address")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "doctorName", "doctorName", root, cb, predicates);
                applyFilter(filters, "qualification", "qualification", root, cb, predicates);
                applyFilter(filters, "specialist", "specialist", root, cb, predicates);
                applyFilter(filters, "experience", "experience", root, cb, predicates);
                applyFilter(filters, "location", "location", root, cb, predicates);
                applyFilter(filters, "hospital", "hospital", root, cb, predicates);

                if (filters.containsKey("maxFee") && !filters.get("maxFee").isBlank()) {
                    try {
                        predicates.add(cb.lessThanOrEqualTo(root.get("fee"), new BigDecimal(filters.get("maxFee"))));
                    } catch (Exception ignored) {}
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<WelfareNetwork> welfareNetworkSpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("businessName")), pattern),
                        cb.like(cb.lower(root.get("serviceType")), pattern),
                        cb.like(cb.lower(root.get("state")), pattern),
                        cb.like(cb.lower(root.get("districtRegion")), pattern),
                        cb.like(cb.lower(root.get("area")), pattern),
                        cb.like(cb.lower(root.get("address")), pattern),
                        cb.like(cb.lower(root.get("cityRegion")), pattern),
                        cb.like(cb.lower(root.get("contactNumber")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "businessName", "businessName", root, cb, predicates);
                applyFilter(filters, "serviceType", "serviceType", root, cb, predicates);
                applyFilter(filters, "state", "state", root, cb, predicates);
                applyFilter(filters, "districtRegion", "districtRegion", root, cb, predicates);
                applyFilter(filters, "area", "area", root, cb, predicates);
                applyFilter(filters, "cityRegion", "cityRegion", root, cb, predicates);

                if (filters.containsKey("rating") && !filters.get("rating").isBlank()) {
                    try {
                        predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), new BigDecimal(filters.get("rating"))));
                    } catch (Exception ignored) {}
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static <T> void applyFilter(Map<String, String> filters, String filterKey, String entityField,
                                       jakarta.persistence.criteria.Root<T> root,
                                       jakarta.persistence.criteria.CriteriaBuilder cb,
                                       List<Predicate> predicates) {
        if (filters.containsKey(filterKey) && filters.get(filterKey) != null && !filters.get(filterKey).isBlank()) {
            predicates.add(cb.equal(cb.lower(root.get(entityField)), filters.get(filterKey).toLowerCase().trim()));
        }
    }
}
