package com.skillswap.dto;

import jakarta.validation.constraints.NotBlank;

public class RescheduleRequest {

    @NotBlank(message = "Proposed date is required")
    private String proposedDate;

    @NotBlank(message = "Proposed time is required")
    private String proposedTime;

    private String rescheduleProposedBy;

    public RescheduleRequest() {
    }

    public RescheduleRequest(String proposedDate, String proposedTime, String rescheduleProposedBy) {
        this.proposedDate = proposedDate;
        this.proposedTime = proposedTime;
        this.rescheduleProposedBy = rescheduleProposedBy;
    }

    public String getProposedDate() { return proposedDate; }
    public void setProposedDate(String proposedDate) { this.proposedDate = proposedDate; }

    public String getProposedTime() { return proposedTime; }
    public void setProposedTime(String proposedTime) { this.proposedTime = proposedTime; }

    public String getRescheduleProposedBy() { return rescheduleProposedBy; }
    public void setRescheduleProposedBy(String rescheduleProposedBy) { this.rescheduleProposedBy = rescheduleProposedBy; }
}
