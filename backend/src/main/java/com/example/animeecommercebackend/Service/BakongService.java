package com.example.animeecommercebackend.Service;

import kh.gov.nbc.bakong_khqr.model.KHQRCurrency;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;

public interface BakongService {

    KHQRResponse<KHQRData> generateMerchantKhqr(
            String billNumber,
            double amount,
            KHQRCurrency currency
    );
}
