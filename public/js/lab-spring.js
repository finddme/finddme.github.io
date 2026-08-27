// 의존성 없는 경량 spring. Apple "Designing Fluid Interfaces"의 두 파라미터
// (response, dampingRatio)를 물리 stiffness/damping으로 환산해 semi-implicit
// Euler로 적분한다. interruptible(언제든 target 교체 가능) · velocity-aware.
//
//   - response      : 값이 target에 도달하는 체감 속도(초). 낮을수록 스냅.
//                     "duration"이 아니라 스프링 특성에서 정착 시간이 창발함.
//   - dampingRatio  : overshoot 제어. 1=임계감쇠(바운스 없음), <1=바운스.
//
// 사용:
//   var s = new LabSpring({ response: 0.45, dampingRatio: 0.75 });
//   s.target = 1;          // 언제든 교체 (모션은 현재 값에서 이어짐)
//   s.step(dt);            // rAF 루프에서 매 프레임 (dt = 초)
//   s.value;              // 현재 화면에 반영할 값
//   s.isResting();        // target 근처에서 사실상 멈췄는지
(function () {
  function LabSpring(opts) {
    opts = opts || {};
    this.response = opts.response != null ? opts.response : 0.45;
    this.dampingRatio = opts.dampingRatio != null ? opts.dampingRatio : 1;
    this.value = opts.value || 0;
    this.velocity = opts.velocity || 0;
    this.target = opts.target != null ? opts.target : this.value;
    // 정지 판정 임계값(값·속도 모두 이보다 작으면 target에 snap).
    this.restDelta = opts.restDelta != null ? opts.restDelta : 0.0005;
  }

  LabSpring.prototype._coeffs = function () {
    // mass=1 기준. stiffness=(2π/response)², damping=4π·ζ/response.
    var omega = (2 * Math.PI) / this.response;
    return { k: omega * omega, c: 2 * this.dampingRatio * omega };
  };

  // dt(초) 만큼 적분. 큰 dt(탭 전환 등)에서 폭주하지 않도록 잘게 나눠 밟는다.
  LabSpring.prototype.step = function (dt) {
    if (dt <= 0) {
      return this.value;
    }
    var co = this._coeffs();
    // 안정성을 위해 서브스텝(최대 1/240초)으로 쪼갠다.
    var remaining = Math.min(dt, 0.064);
    var maxStep = 1 / 240;
    while (remaining > 0) {
      var h = remaining > maxStep ? maxStep : remaining;
      var a = -co.k * (this.value - this.target) - co.c * this.velocity;
      this.velocity += a * h;
      this.value += this.velocity * h;
      remaining -= h;
    }
    if (this.isResting()) {
      this.value = this.target;
      this.velocity = 0;
    }
    return this.value;
  };

  LabSpring.prototype.isResting = function () {
    return (
      Math.abs(this.velocity) < this.restDelta &&
      Math.abs(this.target - this.value) < this.restDelta
    );
  };

  window.LabSpring = LabSpring;
})();
