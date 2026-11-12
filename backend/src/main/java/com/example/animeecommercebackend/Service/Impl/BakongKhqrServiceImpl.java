package com.example.animeecommercebackend.Service.Impl;

import com.example.animeecommercebackend.Config.BakongConfig;
import com.example.animeecommercebackend.Service.BakongService;
import kh.gov.nbc.bakong_khqr.BakongKHQR;
import kh.gov.nbc.bakong_khqr.model.KHQRCurrency;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;
import kh.gov.nbc.bakong_khqr.model.MerchantInfo;

public class BakongKhqrServiceImpl implements BakongService {

    private final BakongConfig bakongConfig;

    public BakongKhqrServiceImpl(BakongConfig bakongConfig){
        this.bakongConfig = bakongConfig;
    }
    @Override
    public KHQRResponse<KHQRData> generateMerchantKhqr(String billNumber, double amount, KHQRCurrency currency) {
        if(amount <= 0 || !Double.isFinite(amount)){
            throw new IllegalArgumentException("Invalid payment amount");
        }
        if(currency == null){
            throw new IllegalArgumentException("Currency is required");
        }

        if(billNumber == null || billNumber.isBlank()){
            throw new IllegalArgumentException("Bill number is required");
        }

        MerchantInfo merchantInfo = new MerchantInfo();

        merchantInfo.setBakongAccountId(bakongConfig.getKhqr().getAccountId());

        merchantInfo.setMerchantName(bakongConfig.getKhqr().getMerchantName());

        merchantInfo.setMerchantCity(bakongConfig.getKhqr().getMerchantCity());

        merchantInfo.setCurrency(currency);
        merchantInfo.setAmount(amount);
        merchantInfo.setBillNumber(billNumber);
        merchantInfo.setStoreLabel("ANTEIKU");

        KHQRResponse<KHQRData> response = BakongKHQR.generateMerchant(merchantInfo);

        if(response == null || response.getData() == null){
            throw new IllegalArgumentException("Failed to generate Bakong KHQR");
        }
        return response;
    }
}
