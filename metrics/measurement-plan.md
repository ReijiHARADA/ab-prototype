# Measurement Plan

## 主要指標 / Primary metric

- `cta_click_rate`: CTA のクリック率  
  CTA 클릭률

## 補助指標 / Secondary metrics

- `add_to_cart_rate`: カート追加率  
  장바구니 추가율
- `purchase_intent_score`: 購買意図スコア  
  구매의도 점수
- `trust_score`: 信頼感スコア  
  신뢰감 점수
- `persuasiveness_score`: 説得力スコア  
  설득력 점수

## イベント一覧 / Event list

- `view_product_detail`: 商品詳細画面表示  
  상품 상세 화면 노출
- `impression_social_proof`: ソーシャルプルーフ表示  
  소셜 프루프 노출
- `click_cta`: CTA クリック  
  CTA 클릭
- `add_to_cart`: カート追加  
  장바구니 추가
- `submit_survey`: 事後アンケート送信  
  사후 설문 제출

## セグメント / Segmentation

- 国: 日本 / 韓国  
  국가: 일본 / 한국
- バリアント: A / B  
  변형안: A / B
- ソーシャルプルーフ種別: 全体人気 / 地域 / 年代属性 / 状況類似  
  소셜 프루프 종류: 전체 인기 / 지역 / 연령 속성 / 상황 유사성

## 成功基準 / Success threshold

最低限の成功条件は、Variant B が Variant A より CTA クリック率で改善を示し、補助指標でも悪化しないこと。  
최소 성공 조건은 Variant B가 Variant A보다 CTA 클릭률에서 개선을 보이고, 보조 지표에서도 악화되지 않는 것이다.

## 記録メモ / Logging notes

- 文言の日本語版と韓国語版は別管理し、同じ意味になるようにレビューする  
  일본어 문구와 한국어 문구는 따로 관리하되 같은 의미가 되도록 검토한다
- Figma の最終配置が確定したら、表示位置をイベント定義に追記する  
  Figma의 최종 배치가 확정되면 표시 위치를 이벤트 정의에 추가한다
