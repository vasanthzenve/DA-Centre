package com.veterinary.research.repository.spec;

import com.veterinary.research.entity.*;
import com.veterinary.research.entity.FashionDesigner;
import com.veterinary.research.entity.FashionInstitute;
import com.veterinary.research.entity.CourierTier1;
import com.veterinary.research.entity.PetManufacturer;
import com.veterinary.research.entity.HumanPetLab;
import com.veterinary.research.entity.Livestock;
import com.veterinary.research.entity.PhilippinesPetProduct;
import com.veterinary.research.entity.Poultry;
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

    public static Specification<FashionDesigner> fashionDesignerSpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("designerName")), pattern),
                        cb.like(cb.lower(root.get("brandName")), pattern),
                        cb.like(cb.lower(root.get("specification")), pattern),
                        cb.like(cb.lower(root.get("city")), pattern),
                        cb.like(cb.lower(root.get("state")), pattern),
                        cb.like(cb.lower(root.get("country")), pattern),
                        cb.like(cb.lower(root.get("officialEmail")), pattern),
                        cb.like(cb.lower(root.get("mobileNumber")), pattern),
                        cb.like(cb.lower(root.get("pincode")), pattern),
                        cb.like(cb.lower(root.get("studioAddress")), pattern),
                        cb.like(cb.lower(root.get("yearOfEstablishment")), pattern),
                        cb.like(cb.lower(root.get("verificationStatus")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "city", "city", root, cb, predicates);
                applyFilter(filters, "state", "state", root, cb, predicates);
                applyFilter(filters, "country", "country", root, cb, predicates);
                applyFilter(filters, "specification", "specification", root, cb, predicates);
                applyFilter(filters, "verificationStatus", "verificationStatus", root, cb, predicates);
                applyFilter(filters, "verification_status", "verificationStatus", root, cb, predicates);
                applyFilter(filters, "status", "verificationStatus", root, cb, predicates);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<FashionInstitute> fashionInstituteSpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("instituteName")), pattern),
                        cb.like(cb.lower(root.get("state")), pattern),
                        cb.like(cb.lower(root.get("city")), pattern),
                        cb.like(cb.lower(root.get("area")), pattern),
                        cb.like(cb.lower(root.get("address")), pattern),
                        cb.like(cb.lower(root.get("pincode")), pattern),
                        cb.like(cb.lower(root.get("phoneNo")), pattern),
                        cb.like(cb.lower(root.get("emailId")), pattern),
                        cb.like(cb.lower(root.get("verificationStatus")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "state", "state", root, cb, predicates);
                applyFilter(filters, "city", "city", root, cb, predicates);
                applyFilter(filters, "area", "area", root, cb, predicates);
                applyFilter(filters, "verificationStatus", "verificationStatus", root, cb, predicates);
                applyFilter(filters, "verification_status", "verificationStatus", root, cb, predicates);
                applyFilter(filters, "status", "verificationStatus", root, cb, predicates);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<CourierTier1> courierTier1Spec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("companyName")), pattern),
                        cb.like(cb.lower(root.get("state")), pattern),
                        cb.like(cb.lower(root.get("city")), pattern),
                        cb.like(cb.lower(root.get("address")), pattern),
                        cb.like(cb.lower(root.get("pincode")), pattern),
                        cb.like(cb.lower(root.get("phoneNumber")), pattern),
                        cb.like(cb.lower(root.get("services")), pattern),
                        cb.like(cb.lower(root.get("website")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "state", "state", root, cb, predicates);
                applyFilter(filters, "city", "city", root, cb, predicates);
                applyFilter(filters, "companyName", "companyName", root, cb, predicates);
                applyFilter(filters, "company_name", "companyName", root, cb, predicates);
                if (filters.containsKey("rating") && !filters.get("rating").isBlank()) {
                    try {
                        predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), new BigDecimal(filters.get("rating"))));
                    } catch (Exception ignored) {}
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<PetManufacturer> petManufacturerSpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("manufacturerName")), pattern),
                        cb.like(cb.lower(root.get("country")), pattern),
                        cb.like(cb.lower(root.get("manufacturerAddress")), pattern),
                        cb.like(cb.lower(root.get("productCategory")), pattern),
                        cb.like(cb.lower(root.get("mobileNumber")), pattern),
                        cb.like(cb.lower(root.get("emailId")), pattern),
                        cb.like(cb.lower(root.get("exportCountries")), pattern),
                        cb.like(cb.lower(root.get("verification")), pattern),
                        cb.like(cb.lower(root.get("analyst")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "country", "country", root, cb, predicates);
                applyFilter(filters, "productCategory", "productCategory", root, cb, predicates);
                applyFilter(filters, "product_category", "productCategory", root, cb, predicates);
                applyFilter(filters, "category", "productCategory", root, cb, predicates);
                applyFilter(filters, "verification", "verification", root, cb, predicates);
                applyFilter(filters, "analyst", "analyst", root, cb, predicates);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }


    public static Specification<HumanPetLab> humanPetLabSpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("laboratoryName")), pattern),
                        cb.like(cb.lower(root.get("laboratoryType")), pattern),
                        cb.like(cb.lower(root.get("state")), pattern),
                        cb.like(cb.lower(root.get("city")), pattern),
                        cb.like(cb.lower(root.get("laboratoryAddress")), pattern),
                        cb.like(cb.lower(root.get("contactNumber")), pattern),
                        cb.like(cb.lower(root.get("emailId")), pattern),
                        cb.like(cb.lower(root.get("testingServices")), pattern),
                        cb.like(cb.lower(root.get("animalTypesCovered")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "laboratoryName", "laboratoryName", root, cb, predicates);
                applyFilter(filters, "laboratory_name", "laboratoryName", root, cb, predicates);
                applyFilter(filters, "laboratoryType", "laboratoryType", root, cb, predicates);
                applyFilter(filters, "laboratory_type", "laboratoryType", root, cb, predicates);
                applyFilter(filters, "type", "laboratoryType", root, cb, predicates);
                applyFilter(filters, "state", "state", root, cb, predicates);
                applyFilter(filters, "city", "city", root, cb, predicates);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Livestock> livestockSpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("livestockType")), pattern),
                        cb.like(cb.lower(root.get("farmType")), pattern),
                        cb.like(cb.lower(root.get("district")), pattern),
                        cb.like(cb.lower(root.get("state")), pattern),
                        cb.like(cb.lower(root.get("area")), pattern),
                        cb.like(cb.lower(root.get("address")), pattern),
                        cb.like(cb.lower(root.get("pincode")), pattern),
                        cb.like(cb.lower(root.get("contactNumber")), pattern),
                        cb.like(cb.lower(root.get("services")), pattern),
                        cb.like(cb.lower(root.get("businessStatus")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "name", "name", root, cb, predicates);
                applyFilter(filters, "livestockType", "livestockType", root, cb, predicates);
                applyFilter(filters, "livestock_type", "livestockType", root, cb, predicates);
                applyFilter(filters, "type", "livestockType", root, cb, predicates);
                applyFilter(filters, "farmType", "farmType", root, cb, predicates);
                applyFilter(filters, "farm_type", "farmType", root, cb, predicates);
                applyFilter(filters, "state", "state", root, cb, predicates);
                applyFilter(filters, "district", "district", root, cb, predicates);
                applyFilter(filters, "businessStatus", "businessStatus", root, cb, predicates);
                applyFilter(filters, "status", "businessStatus", root, cb, predicates);
                if (filters.containsKey("rating") && !filters.get("rating").isBlank()) {
                    try {
                        predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), new BigDecimal(filters.get("rating"))));
                    } catch (Exception ignored) {}
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<PhilippinesPetProduct> philippinesPetProductSpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("productName")), pattern),
                        cb.like(cb.lower(root.get("brandName")), pattern),
                        cb.like(cb.lower(root.get("marketplaceName")), pattern),
                        cb.like(cb.lower(root.get("availability")), pattern),
                        cb.like(cb.lower(root.get("country")), pattern),
                        cb.like(cb.lower(root.get("productDescription")), pattern),
                        cb.like(cb.lower(root.get("command")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "brandName", "brandName", root, cb, predicates);
                applyFilter(filters, "brand_name", "brandName", root, cb, predicates);
                applyFilter(filters, "marketplaceName", "marketplaceName", root, cb, predicates);
                applyFilter(filters, "marketplace_name", "marketplaceName", root, cb, predicates);
                applyFilter(filters, "availability", "availability", root, cb, predicates);
                applyFilter(filters, "country", "country", root, cb, predicates);
                if (filters.containsKey("minPrice") && !filters.get("minPrice").isBlank()) {
                    try {
                        predicates.add(cb.greaterThanOrEqualTo(root.get("currentSellingPricePhp"), new BigDecimal(filters.get("minPrice"))));
                    } catch (Exception ignored) {}
                }
                if (filters.containsKey("maxPrice") && !filters.get("maxPrice").isBlank()) {
                    try {
                        predicates.add(cb.lessThanOrEqualTo(root.get("currentSellingPricePhp"), new BigDecimal(filters.get("maxPrice"))));
                    } catch (Exception ignored) {}
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Poultry> poultrySpec(String query, Map<String, String> filters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("category")), pattern),
                        cb.like(cb.lower(root.get("subCategory")), pattern),
                        cb.like(cb.lower(root.get("district")), pattern),
                        cb.like(cb.lower(root.get("state")), pattern),
                        cb.like(cb.lower(root.get("area")), pattern),
                        cb.like(cb.lower(root.get("address")), pattern),
                        cb.like(cb.lower(root.get("pincode")), pattern),
                        cb.like(cb.lower(root.get("phone")), pattern),
                        cb.like(cb.lower(root.get("businessTag")), pattern),
                        cb.like(cb.lower(root.get("status")), pattern),
                        cb.like(cb.lower(root.get("source")), pattern)
                );
                predicates.add(searchPredicate);
            }

            if (filters != null) {
                applyFilter(filters, "category", "category", root, cb, predicates);
                applyFilter(filters, "subCategory", "subCategory", root, cb, predicates);
                applyFilter(filters, "sub_category", "subCategory", root, cb, predicates);
                applyFilter(filters, "state", "state", root, cb, predicates);
                applyFilter(filters, "district", "district", root, cb, predicates);
                applyFilter(filters, "status", "status", root, cb, predicates);
                applyFilter(filters, "businessTag", "businessTag", root, cb, predicates);
                applyFilter(filters, "business_tag", "businessTag", root, cb, predicates);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

}
