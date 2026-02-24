export function mapFedexTrackingResponse(fedex: any) {
  const trackResult =
    fedex?.output?.completeTrackResults?.[0]?.trackResults?.[0];

  if (!trackResult) {
    return null;
  }

  return {
    trackingNumber: trackResult.trackingNumberInfo?.trackingNumber,
    carrier: 'FedEx',
    serviceType: trackResult.serviceDetail?.description,

    currentStatus: {
      status: trackResult.latestStatusDetail?.statusByLocale,
      description: trackResult.latestStatusDetail?.description,
      location: {
        city: trackResult.latestStatusDetail?.scanLocation?.city,
        state:
          trackResult.latestStatusDetail?.scanLocation?.stateOrProvinceCode,
        country: trackResult.latestStatusDetail?.scanLocation?.countryName,
      },
      lastUpdated: trackResult.latestStatusDetail?.scanDate,
    },

    route: {
      origin: {
        city: trackResult.shipperInformation?.address?.city,
        state: trackResult.shipperInformation?.address?.stateOrProvinceCode,
        country: trackResult.shipperInformation?.address?.countryName,
      },
      destination: {
        city: trackResult.recipientInformation?.address?.city,
        state: trackResult.recipientInformation?.address?.stateOrProvinceCode,
        country: trackResult.recipientInformation?.address?.countryName,
      },
    },

    pickupDetails: {
      isHoldAtLocation: !!trackResult.holdAtLocation,
      address: trackResult.holdAtLocation?.address
        ? {
          street: trackResult.holdAtLocation.address.streetLines?.[0],
          city: trackResult.holdAtLocation.address.city,
          state: trackResult.holdAtLocation.address.stateOrProvinceCode,
          postalCode: trackResult.holdAtLocation.address.postalCode,
          country: trackResult.holdAtLocation.address.countryName,
        }
        : null,
    },

    package: {
      weight: trackResult.packageDetails?.weightAndDimensions?.weight?.[0]
        ?.value
        ? `${trackResult.packageDetails.weightAndDimensions.weight[0].value} ${trackResult.packageDetails.weightAndDimensions.weight[0].unit}`
        : null,
      dimensions: trackResult.packageDetails?.weightAndDimensions?.dimensions
        ? `${trackResult.packageDetails.weightAndDimensions.dimensions.length} x ${trackResult.packageDetails.weightAndDimensions.dimensions.width} x ${trackResult.packageDetails.weightAndDimensions.dimensions.height} ${trackResult.packageDetails.weightAndDimensions.dimensions.units}`
        : null,
      count: trackResult.packageCount,
    },

    timeline: (() => {
      if (!trackResult.scanEvents) return [];

      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + 3); // Picked up = Today + 3

      // Sort events by original date ASC (oldest first)
      const sortedEvents = [...trackResult.scanEvents].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      let currentDate = new Date(baseDate);

      return sortedEvents.map((scan, index) => {
        // If status is Picked up → reset to baseDate
        if (scan.eventDescription === "Picked up") {
          currentDate = new Date(baseDate);
        } else {
          // Increment 1 day for every next status
          currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
          date: new Date(currentDate).toISOString(),
          status: scan.eventDescription,
          location:
            scan.scanLocation?.city && scan.scanLocation?.stateOrProvinceCode
              ? `${scan.scanLocation.city}, ${scan.scanLocation.stateOrProvinceCode}`
              : scan.scanLocation?.city || "N/A",
        };
      });
    })(),
  };
}
