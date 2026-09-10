<template>
  <div>
    <!-- TopAppBar -->
    <header class="fixed top-0 w-full border-b border-primary/10 bg-white/75 backdrop-blur-3xl shadow-[0_12px_32px_rgba(33,79,131,0.08)] flex justify-between items-center px-6 h-14 w-full z-50">
      <div class="leading_type flex items-center">
        <img alt="EURFOREX" width="40" height="40" decoding="async" class="h-10 w-10 shrink-0 object-contain block" :src="logoSrc" />
      </div>
      <div class="font-headline text-lg font-bold text-on-surface">{{ localizedText("個人中心", "Profile") }}</div>
      <div class="trailing_type text-primary-dim hover:bg-primary/10 transition-colors scale-95 active:duration-150 p-2 rounded-full cursor-pointer flex items-center justify-center">
        <img class="eurforex-icon-img eurforex-icon-img--top" :src="profileIcons.bell" alt="" aria-hidden="true" />
      </div>
    </header>

    <!-- Main Content Canvas -->
    <main class="pt-20 pb-32 px-4 md:px-8 max-w-5xl mx-auto relative z-10">
      <!-- Background Ambient Lighting -->
      <div class="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[150px]"></div>
      </div>

      <!-- Hero Profile -->
      <section class="rounded-[28px] p-5 md:p-6 mb-3 relative z-10 overflow-hidden border border-white/60 bg-gradient-to-br from-primary-fixed via-white/70 to-primary-container shadow-[0_18px_36px_rgba(40,88,142,0.1)]">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.7),transparent_45%)]"></div>
        <div class="eurforex-profile-hero relative z-10">
          <div class="eurforex-profile-hero__left">
            <div class="eurforex-profile-hero__avatar-wrap">
              <div class="absolute inset-0 bg-white/55 rounded-[1.75rem] blur-xl"></div>
              <button
                type="button"
                class="relative z-10 group block rounded-[1.5rem] border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                :aria-label="localizedText('更換使用者大頭照', 'Change avatar')"
                @click="openAvatarPicker"
              >
                <img :alt="localizedText('使用者大頭照', 'User avatar')" class="w-24 h-24 md:w-28 md:h-28 rounded-[1.5rem] object-cover border border-white/70 shadow-[0_18px_36px_rgba(40,88,142,0.14)] transition-transform group-hover:scale-[1.02]" :src="avatarSrc" />
                <span class="absolute inset-x-2 bottom-2 rounded-full bg-on-surface/58 px-2 py-1 text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">{{ avatarUploading ? localizedText("上傳中", "Uploading") : localizedText("上傳照片", "Upload photo") }}</span>
              </button>
              <div class="eurforex-profile-hero__level">
                <span>{{ tierLevelLabel }}</span>
              </div>
            </div>
            <input
              ref="avatarFileInput"
              class="eurforex-avatar-file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              aria-hidden="true"
              tabindex="-1"
              @change="handleAvatarFileChange"
            />
            <button
              type="button"
              class="eurforex-profile-hero__id"
              :aria-label="localizedText('複製 UID', 'Copy UID')"
              @click="copyUserId"
            >
              <span>ID</span>
              <strong>{{ userId }}</strong>
              <img class="eurforex-icon-img eurforex-icon-img--copy" :src="profileIcons.copy" alt="" aria-hidden="true" />
            </button>
          </div>
          <div class="eurforex-profile-hero__right">
            <div class="eurforex-profile-hero__headline">
              <h2>{{ realName }}</h2>
              <span>
                <img class="eurforex-icon-img eurforex-icon-img--inline" :src="profileIcons.shield" alt="" aria-hidden="true" />
                {{ localizedText("信用分", "Score") }} {{ creditScore }}
              </span>
            </div>
            <div class="eurforex-profile-hero__meta">
              <div>
                <img class="eurforex-icon-img eurforex-icon-img--meta" :src="profileIcons.phone" alt="" aria-hidden="true" />
                <span>{{ mobileLabel }}</span>
              </div>
              <div>
                <img class="eurforex-icon-img eurforex-icon-img--meta" :src="profileIcons.mail" alt="" aria-hidden="true" />
                <span>{{ emailLabel }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="eurforex-profile-quick-actions relative z-10 mb-3" :aria-label="localizedText('快捷操作', 'Quick actions')">
        <a class="eurforex-profile-quick-action eurforex-profile-quick-action--deposit" href="#/pages/setting/mixrecharge">
          <span class="eurforex-profile-quick-action__icon"><img :src="profileIcons.topup" alt="" aria-hidden="true" /></span>
          <span class="eurforex-profile-quick-action__label">{{ localizedText("充值", "Top up") }}</span>
        </a>
        <a class="eurforex-profile-quick-action eurforex-profile-quick-action--swap" href="#/pages/setting/swap">
          <span class="eurforex-profile-quick-action__icon"><img :src="profileIcons.swap" alt="" aria-hidden="true" /></span>
          <span class="eurforex-profile-quick-action__label">{{ localizedText("閃兌", "Swap") }}</span>
        </a>
        <button type="button" class="eurforex-profile-quick-action eurforex-profile-quick-action--withdraw" @click="withdrawSheetOpen = true">
          <span class="eurforex-profile-quick-action__icon"><img :src="profileIcons.withdraw" alt="" aria-hidden="true" /></span>
          <span class="eurforex-profile-quick-action__label">{{ localizedText("提現", "Withdraw") }}</span>
        </button>
        <a class="eurforex-profile-quick-action eurforex-profile-quick-action--records" href="#/pages/setting/fundRecord">
          <span class="eurforex-profile-quick-action__icon"><img :src="profileIcons.records" alt="" aria-hidden="true" /></span>
          <span class="eurforex-profile-quick-action__label">{{ localizedText("資金紀錄", "Records") }}</span>
        </a>
      </section>
      <!-- Bento Grid: Account Cards -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-4 relative z-10">
        <!-- 可用餘額 -->
        <div class="lg:col-span-12 glass-panel rounded-[28px] p-5 md:p-6 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-surface/0 to-secondary/5 opacity-60"></div>
          <div class="relative z-10">
            <div class="grid grid-cols-2 gap-3">
              <a class="rounded-2xl bg-white/55 border border-white/60 backdrop-blur-md px-4 pt-4 pb-3 shadow-[0_10px_24px_rgba(33,79,131,0.08)] min-h-[96px] block hover:bg-white/65 transition-colors active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/25" href="#/pages/setting/wallet" aria-label="前往我的資產（法幣）">
                <div class="flex items-center justify-between">
                <span class="font-body text-xs text-primary-dim">{{ localizedText("法幣", "Fiat") }}</span>
                </div>
                <div ref="eurBalanceAmount" class="eurforex-user-balance-amount font-headline text-on-surface mt-0.5 leading-none tabular-nums">{{ eurBalanceParts.main }}<span class="text-on-surface-variant/50 text-[0.62em] font-headline align-baseline">.{{ eurBalanceParts.decimal }}</span></div>
                <div class="mt-0.5 flex justify-end">
                  <span class="font-body text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">EUR</span>
                </div>
              </a>
              <a class="rounded-2xl bg-white/45 border border-white/55 backdrop-blur-md px-4 pt-4 pb-3 shadow-[0_10px_24px_rgba(33,79,131,0.06)] min-h-[96px] block hover:bg-white/55 transition-colors active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/25" href="#/pages/setting/wallet" :aria-label="localizedText('前往我的資產（加密資產）', 'Go to my crypto assets')">
                <div class="flex items-center justify-between">
                  <span class="font-body text-xs text-primary-dim">{{ localizedText("加密資產", "Crypto assets") }}</span>
                </div>
                <div ref="usdtBalanceAmount" class="eurforex-user-balance-amount font-headline text-on-surface mt-0.5 leading-none tabular-nums">{{ usdtBalanceParts.main }}<span class="text-on-surface-variant/50 text-[0.62em] font-headline align-baseline">.{{ usdtBalanceParts.decimal }}</span></div>
                <div class="mt-0.5 flex justify-end">
                  <span class="font-body text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">USDT</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
      <!-- Settings List -->
      <section class="relative z-10">
        <div class="glass-panel-high eurforex-user-account-menu rounded-[24px] p-2 md:p-3">
          <LanguageSelector button-id="userLanguageButton" variant="menu-row" />
          <a class="flex items-center justify-between gap-4 px-3 py-3.5 cursor-pointer hover:bg-surface-bright/45 rounded-2xl transition-colors group" href="#/pages/setting/fundRecord">
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-primary/8 flex items-center justify-center text-primary border border-primary/10 shrink-0">
                <img class="eurforex-icon-img eurforex-icon-img--menu" :src="profileIcons.bank" alt="" aria-hidden="true" />
              </div>
              <div class="min-w-0">
                <div class="font-body text-base font-semibold text-on-surface">{{ localizedText("資金紀錄", "Fund records") }}</div>
                <div class="text-sm text-on-surface-variant">{{ localizedText("檢視充值、提現與結算紀錄。", "View deposit, withdrawal, and settlement records.") }}</div>
              </div>
            </div>
            <img class="eurforex-icon-img eurforex-icon-img--chevron" :src="profileIcons.chevron" alt="" aria-hidden="true" />
          </a>
          <a class="flex items-center justify-between gap-4 px-3 py-3.5 cursor-pointer hover:bg-surface-bright/45 rounded-2xl transition-colors group" href="#/pages/setting/eurSwapWithdraw">
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-dim border border-primary/15 shrink-0">
                <img class="eurforex-icon-img eurforex-icon-img--menu" :src="profileIcons.swap" alt="" aria-hidden="true" />
              </div>
              <div class="min-w-0">
                <div class="font-body text-base font-semibold text-on-surface">{{ localizedText("換匯提領", "Exchange withdrawal") }}</div>
                <div class="text-sm text-on-surface-variant">{{ localizedText("以 EUR 餘額換算並提領 USDT 至鏈上地址。", "Convert EUR balance and withdraw USDT to a wallet address.") }}</div>
              </div>
            </div>
            <img class="eurforex-icon-img eurforex-icon-img--chevron" :src="profileIcons.chevron" alt="" aria-hidden="true" />
          </a>
          <a class="flex items-center justify-between gap-4 px-3 py-3.5 cursor-pointer hover:bg-surface-bright/45 rounded-2xl transition-colors group" href="#/pages/setting/securityCenter">
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-primary/8 flex items-center justify-center text-primary border border-primary/10 shrink-0">
                <img class="eurforex-icon-img eurforex-icon-img--menu" :src="profileIcons.shield" alt="" aria-hidden="true" />
              </div>
              <div class="min-w-0">
                <div class="font-body text-base font-semibold text-on-surface">{{ localizedText("安全中心", "Security center") }}</div>
                <div class="text-sm text-on-surface-variant">{{ localizedText("KYC 狀態、身份驗證與帳戶保護設定。", "KYC status, identity verification, and account protection settings.") }}</div>
              </div>
            </div>
            <img class="eurforex-icon-img eurforex-icon-img--chevron" :src="profileIcons.chevron" alt="" aria-hidden="true" />
          </a>
          <a class="flex items-center justify-between gap-4 px-3 py-3.5 cursor-pointer hover:bg-surface-bright/45 rounded-2xl transition-colors group" href="#/pages/setting/inviteTeam">
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-secondary/8 flex items-center justify-center text-secondary border border-secondary/10 shrink-0">
                <img class="eurforex-icon-img eurforex-icon-img--menu" :src="profileIcons.group" alt="" aria-hidden="true" />
              </div>
              <div class="min-w-0">
                <div class="font-body text-base font-semibold text-on-surface">{{ localizedText("邀請團隊", "Invite team") }}</div>
                <div class="text-sm text-on-surface-variant">{{ localizedText("管理推薦獎勵與團隊交易成長。", "Manage referral rewards and team trading growth.") }}</div>
              </div>
            </div>
            <img class="eurforex-icon-img eurforex-icon-img--chevron" :src="profileIcons.chevron" alt="" aria-hidden="true" />
          </a>
          <a class="flex items-center justify-between gap-4 px-3 py-3.5 cursor-pointer hover:bg-surface-bright/45 rounded-2xl transition-colors group" href="#/pages/index/serviceCenter">
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-tertiary/8 flex items-center justify-center text-tertiary border border-tertiary/10 shrink-0">
                <img class="eurforex-icon-img eurforex-icon-img--menu" :src="profileIcons.support" alt="" aria-hidden="true" />
              </div>
              <div class="min-w-0">
                <div class="font-body text-base font-semibold text-on-surface">{{ localizedText("客服中心", "Support") }}</div>
                <div class="text-sm text-on-surface-variant">{{ localizedText("付款與訂單問題請聯繫線上客服。", "Contact online support for payment and order issues.") }}</div>
              </div>
            </div>
            <img class="eurforex-icon-img eurforex-icon-img--chevron" :src="profileIcons.chevron" alt="" aria-hidden="true" />
          </a>
          <a class="flex items-center justify-between gap-4 px-3 py-3.5 cursor-pointer hover:bg-surface-bright/45 rounded-2xl transition-colors group" href="#/pages/index/tutorial">
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-primary/8 flex items-center justify-center text-primary-dim border border-primary/10 shrink-0">
                <img class="eurforex-icon-img eurforex-icon-img--menu" :src="profileIcons.school" alt="" aria-hidden="true" />
              </div>
              <div class="min-w-0">
                <div class="font-body text-base font-semibold text-on-surface">{{ localizedText("新手指南", "Getting started") }}</div>
                <div class="text-sm text-on-surface-variant">{{ localizedText("充值、訂單與爭議處理指南。", "Guide for top up, orders, and dispute handling.") }}</div>
              </div>
            </div>
            <img class="eurforex-icon-img eurforex-icon-img--chevron" :src="profileIcons.chevron" alt="" aria-hidden="true" />
          </a>
        </div>
        <div class="glass-panel rounded-[24px] p-2 mt-4 border border-error/15">
          <button class="w-full flex items-center justify-between gap-4 px-3 py-3.5 cursor-pointer hover:bg-error/8 rounded-2xl transition-colors group text-left" id="signOutButton" type="button" @click="handleSignOut">
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-error/6 flex items-center justify-center text-error border border-error/12 shrink-0">
                <img class="eurforex-icon-img eurforex-icon-img--menu" :src="profileIcons.logout" alt="" aria-hidden="true" />
              </div>
              <div class="min-w-0">
                <div class="font-body text-base font-semibold text-error">{{ localizedText("登出", "Sign out") }}</div>
                <div class="text-sm text-on-surface-variant">{{ localizedText("從本裝置安全登出。", "Sign out safely from this device.") }}</div>
              </div>
            </div>
            <img class="eurforex-icon-img eurforex-icon-img--chevron" :src="profileIcons.chevron" alt="" aria-hidden="true" />
          </button>
        </div>
      </section>
    </main>

    <div class="profile-withdraw-sheet-overlay" :class="{ open: withdrawSheetOpen }" @click.self="withdrawSheetOpen = false">
      <section class="profile-withdraw-sheet" role="dialog" aria-modal="true" :aria-label="localizedText('選擇提現方式', 'Select withdrawal type')">
        <div class="profile-withdraw-sheet__handle" aria-hidden="true"></div>
        <div class="profile-withdraw-sheet__head">
          <h2>{{ localizedText("選擇提現方式", "Select withdrawal type") }}</h2>
          <button type="button" @click="withdrawSheetOpen = false" :aria-label="localizedText('關閉', 'Close')">×</button>
        </div>
        <div class="profile-withdraw-sheet__list">
          <a class="profile-withdraw-sheet__item" href="#/pages/setting/withdrawUsdt" @click="withdrawSheetOpen = false">
            <span class="profile-withdraw-sheet__icon profile-withdraw-sheet__icon--crypto"><img :src="profileIcons.withdraw" alt="" aria-hidden="true" /></span>
            <span><strong>{{ localizedText("加密貨幣提現", "Crypto Withdraw") }}</strong><small>{{ localizedText("選擇加密貨幣並鏈上提現", "Choose crypto asset and withdraw on-chain") }}</small></span>
            <span class="material-symbols-outlined">chevron_right</span>
          </a>
          <a class="profile-withdraw-sheet__item" href="#/pages/setting/withdraw" @click="withdrawSheetOpen = false">
            <span class="profile-withdraw-sheet__icon profile-withdraw-sheet__icon--fiat"><img :src="profileIcons.bank" alt="" aria-hidden="true" /></span>
            <span><strong>{{ localizedText("法幣提現", "Fiat Withdraw") }}</strong><small>{{ localizedText("選擇法幣並提現至銀行", "Choose fiat currency and withdraw to bank") }}</small></span>
            <span class="material-symbols-outlined">chevron_right</span>
          </a>
          <a class="profile-withdraw-sheet__item" href="#/pages/setting/eurSwapWithdraw" @click="withdrawSheetOpen = false">
            <span class="profile-withdraw-sheet__icon profile-withdraw-sheet__icon--exchange"><img :src="profileIcons.swap" alt="" aria-hidden="true" /></span>
            <span><strong>{{ localizedText("換匯提領", "Exchange") }}</strong><small>{{ localizedText("和原本換匯提領入口一致", "Same as the original exchange withdrawal") }}</small></span>
            <span class="material-symbols-outlined">chevron_right</span>
          </a>
        </div>
      </section>
    </div>

    <!-- BottomNavBar：須含 eurforex-home-bottom-nav，H5 fixed 才相對視口（見 eurforex-style-refresh.css） -->
    <nav
      class="eurforex-home-bottom-nav fixed bottom-0 left-0 w-full z-50 rounded-t-2xl bg-white/78 backdrop-blur-lg shadow-[0px_-8px_24px_rgba(33,79,131,0.08)] font-['Manrope']"
      :aria-label="localizedText('主頁底部導航', 'Home bottom navigation')"
    >
      <div class="flex justify-around items-center h-20 px-4 pb-safe">
        <a class="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary-dim transition-all" href="#/pages/index/index">
          <img class="eurforex-nav-brand-icon" :src="homeNavLogoSrc" :alt="localizedText('EURFOREX 主頁', 'EURFOREX Home')" />
          <span class="text-[11px] font-semibold tracking-wide mt-0.5">{{ localizedText("主頁", "Home") }}</span>
        </a>
        <a class="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary-dim transition-all" href="#/pages/index/hall">
          <img class="eurforex-icon-img eurforex-icon-img--nav" :src="profileIcons.tradeNav" alt="" aria-hidden="true" />
          <span class="text-[11px] font-semibold tracking-wide mt-0.5">{{ localizedText("交易大廳", "Trading hall") }}</span>
        </a>
        <a class="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary-dim transition-all" href="#/pages/setting/myTask">
          <img class="eurforex-icon-img eurforex-icon-img--nav" :src="profileIcons.orderNav" alt="" aria-hidden="true" />
          <span class="text-[11px] font-semibold tracking-wide mt-0.5">{{ localizedText("訂單", "Orders") }}</span>
        </a>
        <a class="flex flex-col items-center justify-center text-primary-dim bg-primary-container/60 rounded-xl px-3 py-1 transition-all active:scale-90" href="#/pages/setting/user">
          <img class="eurforex-icon-img eurforex-icon-img--nav" :src="profileIcons.profileNavActive" alt="" aria-hidden="true" />
          <span class="text-[11px] font-semibold tracking-wide mt-0.5">{{ localizedText("個人中心", "Profile") }}</span>
        </a>
      </div>
    </nav>
  </div>
</template>

<script>
import { avatar as avatarImage, brandMarkLogo } from '@/assets/images'
import profileBankIcon from '@/static/icons/profile/bank-white.svg'
import profileBellIcon from '@/static/icons/profile/bell.svg'
import profileChevronIcon from '@/static/icons/profile/chevron.svg'
import profileCopyIcon from '@/static/icons/profile/copy.svg'
import profileGroupIcon from '@/static/icons/profile/group-white.svg'
import profileMailIcon from '@/static/icons/profile/mail.svg'
import profileOrderNavIcon from '@/static/icons/profile/order-nav.svg'
import profilePhoneIcon from '@/static/icons/profile/phone.svg'
import profileProfileNavActiveIcon from '@/static/icons/profile/profile-nav-active.svg'
import profileRecordsIcon from '@/static/icons/profile/records-white.svg'
import profileSchoolIcon from '@/static/icons/profile/school-white.svg'
import profileShieldIcon from '@/static/icons/profile/shield-blue.svg'
import profileSupportIcon from '@/static/icons/profile/support-white.svg'
import profileSwapIcon from '@/static/icons/profile/swap-white.svg'
import profileTopupIcon from '@/static/icons/profile/top-up-white.svg'
import profileTradeNavIcon from '@/static/icons/profile/trade-nav.svg'
import profileWithdrawIcon from '@/static/icons/profile/withdraw-white.svg'
import profileLogoutIcon from '@/static/icons/profile/logout-white.svg'
import { getOrCreateUserAvatar } from '@/common/avatarPool'
import { logout, me, userApi } from '@/utils/api'
import { getStoredUser } from '@/utils/session'

/**
 * EURFOREX - 個人中心 (純 H5 Vue2 Options API)
 * 以 docs/previews/nnn/user.html 為唯一基準逐字遷移
 * 外部腳本：../shared/marble-bg.js（動態注入）
 * 原稿內聯 <script>（登出按鈕寫入「last.mode / last.account」並清掉 remember.*）
 *   → 完整遷移到 handleSignOut method，所有 localStorage key 逐字保留
 */
var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--user",
  "font-body",
  "antialiased",
  "min-h-screen",
  "relative",
  "overflow-x-hidden",
  "selection:bg-primary/30",
  "selection:text-primary"
];

export default {
  name: "UserH5",
  data: function () {
    return {
      logoSrc: brandMarkLogo,
      homeNavLogoSrc: brandMarkLogo,
      profileIcons: {
        bank: profileBankIcon,
        bell: profileBellIcon,
        chevron: profileChevronIcon,
        copy: profileCopyIcon,
        group: profileGroupIcon,
        logout: profileLogoutIcon,
        mail: profileMailIcon,
        orderNav: profileOrderNavIcon,
        phone: profilePhoneIcon,
        profileNavActive: profileProfileNavActiveIcon,
        records: profileRecordsIcon,
        school: profileSchoolIcon,
        shield: profileShieldIcon,
        support: profileSupportIcon,
        swap: profileSwapIcon,
        topup: profileTopupIcon,
        tradeNav: profileTradeNavIcon,
        withdraw: profileWithdrawIcon
      },
      avatarSrc: avatarImage,
      userId: "",
      realName: "",
      mobileLabel: "",
      emailLabel: "",
      creditScore: 0,
      tierLevel: 1,
      fiatAvailableBalance: 0,
      usdtAvailableBalance: 0,
      avatarUploading: false,
      fitBalanceResizeHandler: null,
      currentUserProfile: null,
      withdrawSheetOpen: false
    };
  },
  computed: {
    tierLevelLabel: function () {
      return "LV" + (Number(this.tierLevel) > 0 ? Number(this.tierLevel) : 1);
    },
    eurBalanceParts: function () {
      return this.splitMoney(this.fiatAvailableBalance);
    },
    usdtBalanceParts: function () {
      return this.splitMoney(this.usdtAvailableBalance);
    }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) {
        document.body.classList.add(BODY_CLASSES[i]);
      }
      document.body.setAttribute("data-nc2c-page", "user");
      document.body.setAttribute("data-nc2c-locked", "true");
    } catch (e) {}
    this.loadSharedScript("/static/previews/shared/marble-bg.js", "eurforexMarbleBgJs");
    this.applyUserProfile(getStoredUser());
    this.loadUserProfile();
    this.$nextTick(this.fitBalanceAmounts);
    var self = this;
    this.fitBalanceResizeHandler = function () {
      self.fitBalanceAmounts();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.fitBalanceResizeHandler);
    }
  },
  updated: function () {
    this.$nextTick(this.fitBalanceAmounts);
  },
  beforeDestroy: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) {
        document.body.classList.remove(BODY_CLASSES[i]);
      }
      document.body.removeAttribute("data-nc2c-page");
      document.body.removeAttribute("data-nc2c-locked");
    } catch (e) {}
    if (typeof window !== "undefined" && this.fitBalanceResizeHandler) {
      window.removeEventListener("resize", this.fitBalanceResizeHandler);
    }
  },
  methods: {
    applyUserProfile: function (user) {
      if (!user) return;
      this.currentUserProfile = user;
      var userCode = String(user.display_code || user.username || user.account || "").trim();
      var legalName = String(user.real_name || user.legal_name || (user.kyc && user.kyc.legal_name) || "").trim();
      this.userId = userCode || this.$t("phrases.未取得 ID");
      this.realName = legalName || "--";
      this.mobileLabel = String(user.mobile_e164 || user.mobile || "").trim() || this.localizedText("尚未綁定手機", "Not bound phone");
      this.emailLabel = String(user.email || "").trim() || this.localizedText("尚未綁定 Email", "Not bound email");
      this.creditScore = user.tier && typeof user.tier.score !== "undefined" ? Number(user.tier.score) || 0 : 0;
      this.tierLevel = user.tier && typeof user.tier.level !== "undefined" ? Number(user.tier.level) || 1 : this.tierLevel;
      var avatarUrl = String(user.avatar_url || "").trim();
      if (avatarUrl) {
        this.avatarSrc = avatarUrl;
      } else {
        var avatar = getOrCreateUserAvatar(user);
        this.avatarSrc = avatar.src || avatarImage;
      }
    },
    splitMoney: function (value) {
      var n = Number(value || 0);
      if (!isFinite(n) || n < 0) n = 0;
      var parts = n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split(".");
      return { main: parts[0] || "0", decimal: parts[1] || "00" };
    },
    applyOverview: function (overview) {
      var map = (overview && overview.wallet_map) || {};
      var eur = map.eur || {};
      var usdt = map.cash_usdt || {};
      var tier = (overview && overview.tier_profile) || {};
      this.fiatAvailableBalance = Number(eur.available_balance || 0) || 0;
      this.usdtAvailableBalance = Number(usdt.available_balance || 0) || 0;
      if (tier.level != null) this.tierLevel = Number(tier.level) || 1;
      if (tier.score != null) this.creditScore = Number(tier.score) || 0;
      this.$nextTick(this.fitBalanceAmounts);
    },
    fitBalanceAmounts: function () {
      if (typeof window === "undefined") return;
      var refs = [this.$refs.eurBalanceAmount, this.$refs.usdtBalanceAmount];
      refs.forEach(function (el) {
        if (!el) return;
        el.style.fontSize = "";
        el.style.letterSpacing = "";
        var size = parseFloat(window.getComputedStyle(el).fontSize) || 32;
        var minSize = 14;
        var availableWidth = el.clientWidth;
        if (!availableWidth) return;
        while (size > minSize && el.scrollWidth > availableWidth + 1) {
          size -= 1;
          el.style.fontSize = size + "px";
        }
        if (el.scrollWidth > availableWidth + 1) {
          el.style.letterSpacing = "-0.04em";
        }
      });
    },
    loadUserProfile: function () {
      var self = this;
      me()
        .then(function (user) {
          self.applyUserProfile(user);
          return userApi.overview();
        })
        .then(function (overview) {
          self.applyOverview(overview);
        })
        .catch(function () {
          self.applyUserProfile(getStoredUser());
        });
    },
    openAvatarPicker: function () {
      if (!this.currentUserProfile) this.applyUserProfile(getStoredUser());
      if (this.avatarUploading) return;
      var input = this.$refs.avatarFileInput;
      if (input && typeof input.click === "function") {
        input.click();
      }
    },
    handleAvatarFileChange: function (event) {
      var input = event && event.target;
      var file = input && input.files && input.files[0];
      if (!file) return;
      if (!/^image\//i.test(file.type || "")) {
        if (typeof uni !== "undefined" && uni.showToast) {
          uni.showToast({ title: this.$t("phrases.請選擇圖片檔案"), icon: "none" });
        }
        input.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        if (typeof uni !== "undefined" && uni.showToast) {
          uni.showToast({ title: this.$t("phrases.圖片大小不能超過 5MB"), icon: "none" });
        }
        input.value = "";
        return;
      }
      var self = this;
      this.avatarUploading = true;
      if (typeof URL !== "undefined" && URL.createObjectURL) {
        this.avatarSrc = URL.createObjectURL(file);
      }
      if (typeof uni !== "undefined" && uni.showToast) {
        uni.showToast({ title: this.$t("phrases.正在上傳頭像"), icon: "none", duration: 1200 });
      }
      userApi.uploadFile(file, "avatar")
        .then(function (upload) {
          var avatarUrl = upload.url || upload.public_url || "";
          if (!avatarUrl) throw new Error("頭像上傳失敗");
          return userApi.updateAvatarUrl(avatarUrl);
        })
        .then(function (user) {
          if (user) self.applyUserProfile(user);
          if (typeof uni !== "undefined" && uni.showToast) {
            uni.showToast({ title: self.$t("phrases.頭像已更新"), icon: "success", duration: 1400 });
          }
        })
        .catch(function (error) {
          self.applyUserProfile(self.currentUserProfile || getStoredUser());
          if (typeof uni !== "undefined" && uni.showToast) {
            uni.showToast({ title: (error && error.message) || self.$t("phrases.頭像上傳失敗"), icon: "none", duration: 1800 });
          }
        })
        .finally(function () {
          self.avatarUploading = false;
          if (input) input.value = "";
        });
    },
    copyUserId: function () {
      var text = String(this.userId || "").trim();
      if (!text || text === this.$t("phrases.未取得 ID")) {
        if (typeof uni !== "undefined" && uni.showToast) {
          uni.showToast({ title: this.$t("phrases.無可複製的 ID"), icon: "none" });
        }
        return;
      }
      var toast = function (title, icon) {
        if (typeof uni !== "undefined" && uni.showToast) {
          uni.showToast({ title: title, icon: icon || "none", duration: 1800 });
        }
      };
      var self = this;
      var okCopy = function () {
        toast(self.$t("phrases.已複製到剪貼簿"), "success");
      };
      var failCopy = function () {
        toast(self.$t("phrases.複製失敗，請長按 ID 手動複製"), "none");
      };
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(okCopy).catch(function () {
          fallbackExec();
        });
        return;
      }
      function fallbackExec() {
        try {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "readonly");
          ta.setAttribute("aria-hidden", "true");
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          ta.style.top = "0";
          document.body.appendChild(ta);
          ta.select();
          ta.setSelectionRange(0, text.length);
          var ok = document.execCommand("copy");
          document.body.removeChild(ta);
          if (ok) okCopy();
          else failCopy();
        } catch (e) {
          failCopy();
        }
      }
      fallbackExec();
    },
    handleSignOut: function () {
      try {
        var rememberMode = localStorage.getItem("eurforex.remember.mode") || localStorage.getItem("eurforex.last.mode") || "phone";
        var rememberAccount = localStorage.getItem("eurforex.remember.account") || localStorage.getItem("eurforex.last.account") || "";
        if (rememberAccount) {
          localStorage.setItem("eurforex.last.mode", rememberMode);
          localStorage.setItem("eurforex.last.account", rememberAccount);
        }
        localStorage.removeItem("eurforex.remember.enabled");
        localStorage.removeItem("eurforex.remember.mode");
        localStorage.removeItem("eurforex.remember.account");
        localStorage.removeItem("eurforex.remember.secret");
      } catch (e) {}
      logout().catch(function () {}).then(function () {
        window.location.href = "#/pages/common/login";
      });
    }
  }
};
</script>

<style>
@import url("../../static/previews/shared/marble-bg.css");
@import url("../../static/previews/nc2c/css/preview-entry.css");

.eurforex-avatar-file-input {
  position: fixed;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.eurforex-icon-img {
  display: block;
  flex: 0 0 auto;
  object-fit: contain;
}

.eurforex-icon-img--top {
  height: 22px;
  width: 22px;
}

.eurforex-icon-img--copy {
  height: 15px;
  width: 15px;
}

.eurforex-icon-img--inline {
  height: 14px;
  width: 14px;
}

.eurforex-icon-img--meta {
  height: 16px;
  width: 16px;
}

.eurforex-icon-img--heading {
  height: 16px;
  width: 16px;
}

.eurforex-icon-img--receipt {
  height: 24px;
  width: 24px;
}

.eurforex-icon-img--menu {
  height: 22px;
  width: 22px;
}

.eurforex-icon-img--chevron {
  height: 18px;
  opacity: 0.82;
  width: 18px;
}

.eurforex-icon-img--nav {
  height: 24px;
  width: 24px;
}

.eurforex-user-account-menu .w-11.h-11 {
  background: linear-gradient(180deg, #66d1bd 0%, #2f8786 100%) !important;
  border-color: rgba(255, 255, 255, 0.45) !important;
  box-shadow: 0 10px 22px rgba(31, 126, 128, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.52);
}

#signOutButton .w-11.h-11 {
  background: linear-gradient(180deg, #ff8f98 0%, #d94c5b 100%) !important;
  border-color: rgba(255, 255, 255, 0.42) !important;
  box-shadow: 0 10px 22px rgba(217, 76, 91, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.eurforex-profile-hero {
  align-items: center;
  display: grid;
  gap: 18px;
  grid-template-columns: 116px minmax(0, 1fr);
  min-height: 126px;
}

.eurforex-profile-hero__left {
  align-items: center;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

.eurforex-profile-hero__avatar-wrap {
  position: relative;
}

.eurforex-profile-hero__avatar-wrap img {
  height: 92px;
  width: 92px;
}

.eurforex-profile-hero__level {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 999px;
  bottom: -9px;
  box-shadow: 0 10px 20px rgba(33, 79, 131, 0.12);
  padding: 4px 10px;
  position: absolute;
  right: -14px;
  z-index: 20;
}

.eurforex-profile-hero__level span {
  color: #2f73cd;
  display: block;
  font-family: Space Grotesk, sans-serif;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  line-height: 1;
}

.eurforex-profile-hero__id {
  align-items: center;
  background: transparent;
  border: 0;
  color: #617588;
  cursor: pointer;
  display: inline-flex;
  font-size: 12px;
  gap: 7px;
  justify-content: center;
  margin-top: 10px;
  max-width: 100%;
  min-width: 0;
  padding: 0;
}

.eurforex-profile-hero__id strong {
  color: #16293f;
  font-size: 13px;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.eurforex-profile-hero__id .material-symbols-outlined {
  color: rgba(22, 41, 63, 0.55);
  flex: 0 0 auto;
  font-size: 15px;
}

.eurforex-profile-hero__right {
  min-width: 0;
  padding: 2px 0;
}

.eurforex-profile-hero__headline {
  align-items: center;
  border-bottom: 1px solid rgba(145, 179, 207, 0.28);
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr) auto;
  min-width: 0;
  padding-bottom: 10px;
  width: 100%;
}

.eurforex-profile-hero__headline h2 {
  color: #16293f;
  font-family: Space Grotesk, sans-serif;
  font-size: 22px;
  font-weight: 500;
  line-height: 1.12;
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.eurforex-profile-hero__headline > span {
  align-items: center;
  color: #3f73f0;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 650;
  gap: 5px;
  justify-self: end;
  line-height: 1.1;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.eurforex-profile-hero__headline .material-symbols-outlined {
  font-size: 14px;
}

.eurforex-profile-hero__meta {
  display: grid;
  gap: 8px;
  padding-top: 10px;
}

.eurforex-profile-hero__meta > div {
  align-items: center;
  color: #738397;
  display: flex;
  font-size: 14px;
  gap: 10px;
  line-height: 1.25;
  min-width: 0;
}

.eurforex-profile-hero__meta .material-symbols-outlined {
  color: rgba(97, 117, 136, 0.82);
  flex: 0 0 auto;
  font-size: 16px;
}

.eurforex-profile-hero__meta span:last-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.eurforex-profile-quick-actions {
  background:
    linear-gradient(90deg, transparent 0 24.5%, rgba(214, 229, 241, 0.62) 24.5% 24.8%, transparent 24.8% 49.6%, rgba(214, 229, 241, 0.62) 49.6% 49.9%, transparent 49.9% 74.7%, rgba(214, 229, 241, 0.62) 74.7% 75%, transparent 75%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 252, 255, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  box-shadow: 0 18px 34px rgba(40, 88, 142, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.96);
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 9px 10px 8px;
}

.eurforex-profile-quick-action {
  align-items: center;
  color: #16293f;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  text-align: center;
  text-decoration: none;
  transition: transform 0.16s ease, filter 0.16s ease;
}

.eurforex-profile-quick-action:active {
  transform: scale(0.97);
}

.eurforex-profile-quick-action:hover {
  filter: brightness(1.04);
}

.eurforex-profile-quick-action__icon {
  align-items: center;
  border-radius: 14px;
  box-shadow: 0 13px 25px rgba(33, 79, 131, 0.13), inset 0 1px 0 rgba(255, 255, 255, 0.52);
  color: #ffffff;
  display: flex;
  font-size: 24px;
  height: 50px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 50px;
}

.eurforex-profile-quick-action__icon {
  text-shadow: 0 1px 8px rgba(17, 60, 110, 0.16);
}

.eurforex-profile-quick-action__icon img {
  display: block;
  height: 25px;
  object-fit: contain;
  width: 25px;
}

.eurforex-profile-quick-action__label {
  color: #16293f;
  display: block;
  font-size: 13px;
  font-weight: 750;
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.eurforex-profile-quick-action--deposit .eurforex-profile-quick-action__icon {
  background: linear-gradient(135deg, #86bbff 0%, #5b89f2 54%, #4774df 100%);
}

.eurforex-profile-quick-action--sell .eurforex-profile-quick-action__icon {
  background: linear-gradient(135deg, #8b8cff 0%, #6d73f6 52%, #5f62dc 100%);
}

.eurforex-profile-quick-action--swap .eurforex-profile-quick-action__icon {
  background: linear-gradient(135deg, #b687ff 0%, #9255ec 50%, #7a3fd2 100%);
}

.eurforex-profile-quick-action--withdraw .eurforex-profile-quick-action__icon {
  background: linear-gradient(135deg, #a5d8c9 0%, #7fc7b2 50%, #65ad9e 100%);
}

.eurforex-profile-quick-action--records .eurforex-profile-quick-action__icon {
  background: linear-gradient(135deg, #8fd5ff 0%, #66aaf3 52%, #4d87df 100%);
}

.eurforex-user-balance-amount {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  font-size: 2rem;
}

@media (min-width: 768px) {
  .eurforex-user-balance-amount {
    font-size: 2.25rem;
  }

  .eurforex-profile-hero {
    grid-template-columns: 132px minmax(0, 1fr);
  }

  .eurforex-profile-hero__avatar-wrap img {
    height: 104px;
    width: 104px;
  }

  .eurforex-profile-quick-actions {
    gap: 14px;
    padding: 10px 18px 9px;
  }
}

@media (max-width: 374px) {
  .eurforex-profile-hero {
    gap: 14px;
    grid-template-columns: 104px minmax(0, 1fr);
  }

  .eurforex-profile-hero__avatar-wrap img {
    height: 84px;
    width: 84px;
  }

  .eurforex-profile-hero__headline h2 {
    font-size: 20px;
  }

  .eurforex-profile-quick-actions {
    gap: 4px;
    padding-left: 7px;
    padding-right: 7px;
  }

  .eurforex-profile-quick-action__icon {
    border-radius: 13px;
    font-size: 22px;
    height: 46px;
    width: 46px;
  }

  .eurforex-profile-quick-action__label {
    font-size: 11px;
  }
}
</style>

<style scoped>
.profile-withdraw-sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 220;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(18, 31, 48, 0);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease, background 0.18s ease;
}

.profile-withdraw-sheet-overlay.open {
  background: rgba(18, 31, 48, 0.42);
  opacity: 1;
  pointer-events: auto;
}

.profile-withdraw-sheet {
  width: min(100%, 560px);
  border-radius: 28px 28px 0 0;
  max-height: calc(100vh - 72px);
  overflow-y: auto;
  padding: 10px 22px calc(104px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,250,255,0.96));
  border: 1px solid rgba(221, 233, 246, 0.96);
  box-shadow: 0 -20px 50px rgba(17, 54, 94, 0.18), inset 0 1px 0 rgba(255,255,255,0.96);
  transform: translateY(24px);
  transition: transform 0.2s ease;
}

.profile-withdraw-sheet-overlay.open .profile-withdraw-sheet {
  transform: translateY(0);
}

.profile-withdraw-sheet__handle {
  width: 48px;
  height: 5px;
  margin: 0 auto 16px;
  border-radius: 999px;
  background: #d9e5f2;
}

.profile-withdraw-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.profile-withdraw-sheet__head h2 {
  margin: 0;
  color: #111a38;
  font-size: 20px;
  font-weight: 850;
  letter-spacing: -0.03em;
}

.profile-withdraw-sheet__head button {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #75859a;
  font-size: 30px;
  line-height: 1;
}

.profile-withdraw-sheet__list {
  display: grid;
  gap: 12px;
}

.profile-withdraw-sheet__item {
  min-height: 82px;
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 14px;
  padding: 13px 14px;
  border-radius: 20px;
  border: 1px solid #e0ebf6;
  background: rgba(255, 255, 255, 0.8);
  color: inherit;
  text-decoration: none;
  box-shadow: 0 10px 22px rgba(33, 79, 131, 0.06);
}

.profile-withdraw-sheet__icon {
  width: 54px;
  height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  color: #fff;
  box-shadow: 0 12px 22px rgba(31, 126, 128, 0.18), inset 0 1px 0 rgba(255,255,255,0.45);
}

.profile-withdraw-sheet__icon img {
  width: 25px;
  height: 25px;
}

.profile-withdraw-sheet__icon--crypto { background: linear-gradient(135deg, #82d9c3, #2f8786); }
.profile-withdraw-sheet__icon--fiat { background: linear-gradient(135deg, #86bbff, #4774df); }
.profile-withdraw-sheet__icon--exchange { background: linear-gradient(135deg, #b687ff, #7a3fd2); }

.profile-withdraw-sheet__item strong {
  display: block;
  color: #14213d;
  font-size: 18px;
  font-weight: 850;
  line-height: 1.2;
}

.profile-withdraw-sheet__item small {
  display: block;
  margin-top: 4px;
  color: #738397;
  font-size: 13px;
  line-height: 1.3;
}

.eurforex-profile-quick-action--withdraw {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}

</style>
